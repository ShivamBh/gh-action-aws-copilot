import * as os from "os";
import * as core from "@actions/core";
import { HttpClient } from "@actions/http-client";
import { cacheDir, cacheFile, downloadTool, find } from "@actions/tool-cache";
import { chmodSync } from "fs";
import { chmod } from "fs/promises";

const DEFAULT_TOOL_NAME = "aws-copilot-cli";
const entity = core.getInput("entity") || "app";
const command = core.getInput("command") || "install";
const app = core.getInput("app") || null;
const service = core.getInput("service") || null;
const env = core.getInput("env") || null;
const enableForce = core.getBooleanInput("force");
const path = core.getInput("path") || ".";
const cliVersion = core.getInput("useCliVersion") || "latest";

// run the action
async function run(): Promise<void> {
  try {
    const execCommand = composeExecCommand({
      entity,
      command,
      app,
      service,
      env,
      enableForce,
      path,
      cliVersion,
    });
    await install();
  } catch (error) {
    console.error(error);
    if (error instanceof Error) core.setFailed(error.message);
  }
}

// TODO: add arg types
function composeExecCommand(opts: any): string {
  return "";
}

// handle action commands
async function processCommand(command: string): Promise<void> {}

// install the AWS Copilot CLI tool
async function install(): Promise<void> {
  core.info("Installing AWS Copilot...");

  const version =
    cliVersion !== "latest" ? cliVersion : await fetchCopilotLatestVersion();

  const platform = os.platform;
  const releaseUrl = `https://github.com/aws/copilot-cli/releases/download/${version}/copilot-${platform}-${version}`;

  let currentCliPathname = find(DEFAULT_TOOL_NAME, version);

  if (!currentCliPathname) {
    // download cli package
    core.info(`Fetching CLI package from: ${releaseUrl}`);
    const filePath = await downloadTool(releaseUrl, DEFAULT_TOOL_NAME);

    // give permissions
    await chmod(filePath, 755);

    // cache the files version
    currentCliPathname = await cacheFile(
      filePath,
      "copilot",
      DEFAULT_TOOL_NAME,
      version
    );
    core.info(`Downloaded AWS Copilot successfully.`);
    core.info(`Adding Copilot to ${currentCliPathname}`);

    // add to $PATH
    core.addPath(currentCliPathname);

    core.info(`Copilot CLI installed succesfully`);
  }
}

// fetch latest version number
async function fetchCopilotLatestVersion(): Promise<string> {
  const http = new HttpClient("aws-copilot-release");
  const response = await http.get(
    `https://api.github.com/repos/aws/copilot-cli/releases/latest`
  );
  const releaseMetadata = JSON.parse(await response.readBody());
  console.log("version", releaseMetadata.tag_name);
  return releaseMetadata.tag_name;
}

// fetch latest copilot version
// TODO: take version as args
async function fetchLatestVersion() {}

// check if copilot exists in the toolcache
async function copilotAlreadyExists() {}

// deploy copilot app: copilot app deploy -n <app-name> -e <env-name>
async function deployCopilotApp() {}

// deploy copilot env: copilot env deploy -n <env-name>
async function deploytCopilotEnv() {}

// deploy copilot svc: copilot svc deploy -n <svc-name> -e <env-name>
async function deployCopilotService() {}

// create a SecureString in AWS Parameter store
async function createCopilotSecret() {}

// run the action
run();
