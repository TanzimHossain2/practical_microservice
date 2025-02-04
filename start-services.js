const { exec } = require("child_process");
const fs = require("fs");

const servicesDir = "./services"; // Adjust the path if needed

// Read all directories inside "services"
const services = fs.readdirSync(servicesDir).filter(dir => 
  fs.statSync(`${servicesDir}/${dir}`).isDirectory()
);

services.forEach(service => {
  const command = `pnpm dev`;
  console.log(`Starting ${service}...`);

  exec(command, { cwd: `${servicesDir}/${service}` }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error in ${service}:`, error);
      return;
    }
    if (stdout) console.log(`${service} Output:\n${stdout}`);
    if (stderr) console.error(`${service} Error:\n${stderr}`);
  });
});
