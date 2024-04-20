import chalk from "chalk";

export const themes = {
  error: chalk.red,
  success: chalk.green,
  warning: chalk.yellow,
  info: chalk.blue,
};

const log = (
  theme: "error" | "success" | "warning" | "info",
  ...data: any[]
) => {
  console.log(themes[theme](...data));
};

class Logger {
  public error = (...data: any[]) => log("error", "x " + [...data]);
  public success = (...data: any[]) => log("success", "✓ " + [...data]);
  public warning = (...data: any[]) => log("warning", "! " + [...data]);
  public info = (...data: any[]) => log("info", "ⓘ " + [...data]);
  public group = (...data: any[]) =>
    console.group(chalk.bgBlueBright.black(...data));
  public groupEnd = () => console.groupEnd();
}

export default Logger;
