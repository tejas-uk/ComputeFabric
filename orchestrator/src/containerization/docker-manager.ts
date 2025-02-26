/**
 * @description
 * The Docker Manager handles containerization aspects of the Orchestrator.
 * In a real implementation, it would interact with Docker to create, run,
 * and manage containers. For the MVP, it provides stubs for these operations.
 *
 * Key features:
 * - Validate Docker images
 * - Generate container configurations
 * - Provide helper methods for container operations
 *
 * @dependencies
 * - None for MVP (would use dockerode in production)
 *
 * @notes
 * - In the MVP, actual container execution happens in the Provider
 * - This class focuses on configuration generation and validation
 */

/**
 * Interface for container configuration
 */
export interface ContainerConfig {
  image: string;
  command?: string;
  env?: Record<string, string>;
  volumes?: string[];
  gpus?: boolean;
  memoryLimit?: string;
  cpuLimit?: number;
}

/**
 * DockerManager class
 */
export class DockerManager {
  /**
   * Validate a Docker image name
   * @param imageName - The Docker image name to validate
   * @returns True if the image name is valid, false otherwise
   */
  validateImageName(imageName: string): boolean {
    // Basic validation for Docker image names
    // Format: [registry/][namespace/]repository[:tag]
    if (!imageName || typeof imageName !== 'string') {
      return false;
    }
    
    // Simplified validation for MVP - in production, add more checks
    const validImagePattern = /^[a-z0-9]+(\/[a-z0-9]+)*(:[\w][\w.-]{0,127})?$/i;
    return validImagePattern.test(imageName);
  }
  
  /**
   * Generate a container configuration for a job
   * @param jobConfig - Container configuration options
   * @returns A standardized container configuration
   */
  generateContainerConfig(jobConfig: ContainerConfig): ContainerConfig {
    if (!this.validateImageName(jobConfig.image)) {
      throw new Error(`Invalid Docker image name: ${jobConfig.image}`);
    }
    
    // Create a standardized configuration with defaults
    return {
      image: jobConfig.image,
      command: jobConfig.command || '',
      env: jobConfig.env || {},
      volumes: jobConfig.volumes || [],
      gpus: jobConfig.gpus !== undefined ? jobConfig.gpus : true, // Default: use GPU
      memoryLimit: jobConfig.memoryLimit || '4g', // Default: 4GB memory limit
      cpuLimit: jobConfig.cpuLimit || 2, // Default: 2 CPU cores
    };
  }
  
  /**
   * Get Docker run command for a container (for debugging or provider instructions)
   * @param config - Container configuration
   * @returns A docker run command string
   */
  getDockerRunCommand(config: ContainerConfig): string {
    let command = `docker run --rm`;
    
    // Add resource limits
    command += ` --memory=${config.memoryLimit}`;
    command += ` --cpus=${config.cpuLimit}`;
    
    // Add GPU access if needed
    if (config.gpus) {
      command += ` --gpus all`;
    }
    
    // Add environment variables
    if (config.env && Object.keys(config.env).length > 0) {
      for (const [key, value] of Object.entries(config.env)) {
        command += ` -e ${key}="${value}"`;
      }
    }
    
    // Add volume mounts
    if (config.volumes && config.volumes.length > 0) {
      for (const volume of config.volumes) {
        command += ` -v ${volume}`;
      }
    }
    
    // Add image and command
    command += ` ${config.image}`;
    if (config.command) {
      command += ` ${config.command}`;
    }
    
    return command;
  }
}

// Export a singleton instance for use throughout the application
export const dockerManager = new DockerManager();