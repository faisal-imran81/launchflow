import Docker from 'dockerode'

/**
 * Shared Dockerode client.
 * Connects to the local Docker daemon via the default UNIX socket (/var/run/docker.sock).
 * On Windows, Dockerode falls back to the named pipe automatically.
 */
const docker = new Docker()

export default docker
