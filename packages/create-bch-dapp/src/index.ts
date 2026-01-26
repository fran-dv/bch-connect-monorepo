import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { input, select } from "@inquirer/prompts";
import kleur from "kleur";
import ora from "ora";

type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

const DEFAULT_LOCALHOST_REOWN_PROJECT_ID = "2684b13f5add72d95b5cf00ddea3dd4f";
const TEMPLATES = {
	reactVite: {
		label: "React + Vite",
		path: "../templates/react-ts-vite",
	},
	nextjs: {
		label: "Next.js",
		path: "../templates/nextjs",
	},
} as const;

type TemplateKey = keyof typeof TEMPLATES;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isDirEmpty(dir: string): boolean {
	if (!fs.existsSync(dir)) return true;
	const entries = fs.readdirSync(dir);
	return entries.length === 0;
}

function normalizeProjectName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9._-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

async function copyDir(srcDir: string, destDir: string) {
	await fsp.mkdir(destDir, { recursive: true });

	const entries = await fsp.readdir(srcDir, { withFileTypes: true });
	for (const entry of entries) {
		const src = path.join(srcDir, entry.name);
		const dest = path.join(destDir, entry.name);

		const IGNORE_FILES = new Set([
			"node_modules",
			".next",
			"dist",
			".git",
			".DS_Store",
			"bun.lockb",
			"package-lock.json",
			"pnpm-lock.yaml",
			"yarn.lock",
		]);

		if (IGNORE_FILES.has(entry.name)) {
			continue;
		}

		if (entry.isDirectory()) {
			await copyDir(src, dest);
		} else if (entry.isFile()) {
			if (entry.name === "_gitignore") {
				await fsp.copyFile(src, path.join(destDir, ".gitignore"));
			} else {
				await fsp.copyFile(src, dest);
			}
		}
	}
}

async function writeEnvFile(
	targetDir: string,
	opts: { projectId: string; network: "mainnet" | "testnet" },
	template: TemplateKey,
) {
	const envFile = template === "nextjs" ? ".env.local" : ".env";
	const envPath = path.join(targetDir, envFile);
	const viteContents =
		`# BCH Connect starter\n` +
		`VITE_BCH_NETWORK=${opts.network}\n` +
		`VITE_REOWN_PROJECT_ID=${opts.projectId}\n`;
	const nextjsContents =
		`# BCH Connect starter\n` +
		`NEXT_PUBLIC_BCH_NETWORK=${opts.network}\n` +
		`NEXT_PUBLIC_REOWN_PROJECT_ID=${opts.projectId}\n`;
	const contents = template === "reactVite" ? viteContents : nextjsContents;

	await fsp.writeFile(envPath, contents, "utf8");
}

async function patchPackageJsonName(targetDir: string, projectName: string) {
	const pkgPath = path.join(targetDir, "package.json");
	const raw = await fsp.readFile(pkgPath, "utf8");
	const json = JSON.parse(raw) as Record<string, unknown>;
	json.name = normalizeProjectName(projectName);
	if (
		json.dependencies &&
		typeof json.dependencies === "object" &&
		"bch-connect" in json.dependencies
	) {
		json.dependencies["bch-connect"] = "latest";
	}
	await fsp.writeFile(pkgPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}

async function runCommand(
	cwd: string,
	cmd: string,
	args: string[],
	{ silent = false }: { silent?: boolean } = {},
): Promise<number> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, {
			cwd,
			stdio: silent ? "ignore" : "inherit",
			shell: process.platform === "win32",
		});

		child.on("close", (code) => resolve(code ?? 1));
	});
}

function pmInstallCmd(pm: PackageManager): { cmd: string; args: string[] } {
	switch (pm) {
		case "bun":
			return { cmd: "bun", args: ["install"] };
		case "pnpm":
			return { cmd: "pnpm", args: ["install"] };
		case "yarn":
			return { cmd: "yarn", args: ["install"] };
		default:
			return { cmd: "npm", args: ["install"] };
	}
}

function pmDevExec(pm: PackageManager): { cmd: string; args: string[] } {
	switch (pm) {
		case "bun":
			return { cmd: "bun", args: ["run", "dev"] };
		case "pnpm":
			return { cmd: "pnpm", args: ["dev"] };
		case "yarn":
			return { cmd: "yarn", args: ["dev"] };
		default:
			return { cmd: "npm", args: ["run", "dev"] };
	}
}

async function main() {
	const argName = process.argv[2]?.trim();
	const projectName =
		argName ||
		(await input({
			message: "Your project name",
			default: "my-bch-dapp",
		}));

	const targetDir = path.resolve(process.cwd(), projectName);

	if (fs.existsSync(targetDir) && !isDirEmpty(targetDir)) {
		console.error(
			kleur.red(
				`✖ Target directory already exists and is not empty: ${targetDir}`,
			),
		);
		process.exit(1);
	}

	const templateKey = await select<TemplateKey>({
		message: "Choose a template",
		default: "reactVite",
		choices: [
			{ name: TEMPLATES.reactVite.label, value: "reactVite" },
			{ name: TEMPLATES.nextjs.label, value: "nextjs" },
		],
	});

	const templateDir = path.resolve(__dirname, TEMPLATES[templateKey].path);

	if (!fs.existsSync(templateDir)) {
		console.error(kleur.red(`Template not found at: ${templateDir}`));
		process.exit(1);
	}

	const pm = await select<PackageManager>({
		message: "Package manager",
		default: "bun",
		choices: [
			{ name: "bun", value: "bun" },
			{ name: "npm", value: "npm" },
			{ name: "pnpm", value: "pnpm" },
			{ name: "yarn", value: "yarn" },
		],
	});

	const reownMode = await select<"default" | "custom">({
		message: "Reown Project ID",
		default: "default",
		choices: [
			{ name: "Use public ID (localhost only)", value: "default" },
			{ name: "Enter my own ID (required for production)", value: "custom" },
		],
	});

	const reownProjectId =
		reownMode === "custom"
			? await input({
					message: "Paste your Reown Project ID",
					validate(value) {
						if (!value.trim()) return "Project ID is required.";
						if (value.trim().length < 16)
							return "That does not look like a valid Project ID.";
						return true;
					},
				})
			: DEFAULT_LOCALHOST_REOWN_PROJECT_ID;

	const network = await select<"mainnet" | "testnet">({
		message: "Network",
		default: "mainnet",
		choices: [
			{ name: "Mainnet", value: "mainnet" },
			{ name: "Testnet", value: "testnet" },
		],
	});

	const spin = ora("Creating project…").start();
	try {
		await copyDir(templateDir, targetDir);
		await patchPackageJsonName(targetDir, projectName);
		await writeEnvFile(
			targetDir,
			{ projectId: reownProjectId, network },
			templateKey,
		);

		spin.succeed("Project created");
	} catch (e) {
		spin.fail("Failed to create project");
		console.error(e);
		process.exit(1);
	}

	// Install dependencies
	{
		const { cmd, args } = pmInstallCmd(pm);
		const installSpin = ora(`Installing dependencies (${pm})…`).start();
		installSpin.stop(); // installer owns the terminal
		const code = await runCommand(targetDir, cmd, args);
		if (code !== 0) {
			console.error(
				kleur.red(
					`\n✖ Install failed. Run it manually:\n  cd ${projectName}\n  ${cmd} ${args.join(" ")}\n`,
				),
			);
			process.exit(1);
		}
		ora().succeed("Dependencies installed");
	}

	// Start dev server
	console.log("");
	console.log(kleur.green().bold("✓ Starting dev server…"));
	console.log(kleur.dim(`  (running in ${targetDir})`));
	console.log(kleur.dim("  Press Ctrl+C to stop.\n"));

	if (reownMode === "default") {
		console.log(
			kleur.yellow("Note:") +
				" Using a public localhost-only Reown Project ID. Replace it before production.",
		);
		console.log(
			kleur.dim(
				"      Update `.env` and create your own Project ID at: https://dashboard.reown.com/\n",
			),
		);
	}

	const { cmd, args } = pmDevExec(pm);

	const devExitCode = await runCommand(targetDir, cmd, args);
	process.exit(devExitCode);
}

main().catch((e) => {
	console.error(kleur.red(String(e)));
	process.exit(1);
});
