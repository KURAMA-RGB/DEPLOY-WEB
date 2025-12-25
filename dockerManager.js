const Docker = require("dockerode");
const docker = new Docker();

module.exports = {
  runContainer: (id, image, cmd) => {
    return new Promise(async (resolve, reject) => {
      try {
        const container = await docker.createContainer({
          Image: image,
          name: `nebula_${id}`,
          Cmd: cmd.split(" "),
          Tty: true,
          HostConfig: {
            AutoRemove: true
          }
        });

        await container.start();
        resolve({ success: true, id, message: "Started" });
      } catch (e) {
        reject(e);
      }
    });
  },
  getLogs: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const container = docker.getContainer(`nebula_${id}`);
        const logs = await container.logs({ stdout: true, stderr: true });
        resolve(logs.toString());
      } catch (e) {
        reject(e);
      }
    });
  }
};
