/**
 * Package job provides support for jobs.
 *
 * A Job idescribes a particular unit of a build. A Job returns a Result.
 * A JobRunner is an implementation of the runtime logic for a Job.
 */
/** */
import { V1EnvVarSource } from "@kubernetes/client-node/dist/api";
export declare const brigadeCachePath = "/mnt/brigade/cache";
export declare const brigadeStoragePath = "/mnt/brigade/share";
export declare const dockerSocketMountPath = "/var/run/docker.sock";
export declare const dockerSocketMountName = "docker-socket";
/**
 * JobRunner is capable of executing a job within a runtime.
 */
export interface JobRunner {
    start(): Promise<JobRunner>;
    wait(): Promise<Result>;
}
/**
 * Result is the result of a particular Job.
 *
 * Every Result can be converted to a String with the `toString()` function. The
 * string is human-readable.
 */
export interface Result {
    toString(): string;
}
/**
 * Cache controls the job's cache.
 *
 * A cache is a small storage space that is shared between different instances
 * if the same job.
 *
 * Cache is just a plain filesystem, and as such comes with no guarantees about
 * consistency, etc. It should be treated as volatile.
 */
export declare class JobCache {
    /**
     * If enabled=true, a storage cache will be attached.
     */
    enabled: boolean;
    /**
     * size is the amount of storage space assigned to the cache. The default is
     * 5Mi.
     * For sizing information, see https://github.com/kubernetes/community/blob/master/contributors/design-proposals/resources.md
     */
    size: string;
    path: string;
}
/**
 * JobStorage configures build-wide storage preferences for this job.
 *
 * Changes to this object only impact the job, not the entire build.
 */
export declare class JobStorage {
    enabled: boolean;
    path: string;
}
/**
 * JobHost expresses expectations about the host a job will run on.
 */
export declare class JobHost {
    constructor();
    /**
     * os is the name of the OS upon which the job's container must run.
     *
     * This allows users to indicate that the container _must_ run on
     * "windows" or "linux" hosts. It is primarily useful in a "mixed node"
     * environment where the brigade.js will be run on a cluster that has more than
     * one OS
     */
    os?: string;
    /**
     * name of the host to run on.
     *
     * If this is set, a job will ask to be run on this named host. Generally, this
     * should be used only if it is necessary to run the job on a particular host.
     * If not set, Brigade will let the scheduler decide, which is strongly preferred.
     *
     * Example usage: If you use a Kubernetes-ACI bridge, you may want to use this
     * to run jobs on the bridge.
     */
    name?: string;
    /**
     * nodeSelector labels are used as selectors when choosing a node on which to run this job.
     */
    nodeSelector: Map<string, string>;
}
/**
 * JobDockerMount enables or disables mounting the host's docker socket for a job.
 */
export declare class JobDockerMount {
    /**
     * enabled configues whether or not the job will mount the host's docker socket.
     */
    enabled: boolean;
}
/**
 * JobResourceRequest represents request of the resources
 */
export declare class JobResourceRequest {
    /** cpu requests */
    cpu?: string;
    /** memory requests */
    memory?: string;
}
/**
 * JobResourceLimit represents limit of the resources
 */
export declare class JobResourceLimit {
    /** cpu limits */
    cpu?: string;
    /** memory limits */
    memory?: string;
}
/**
 * Job represents a single job, which is composed of several closely related sequential tasks.
 * Jobs must have names. Every job also has an associated image, which references
 * the Docker container to be run.
 * */
export declare abstract class Job {
    static readonly MAX_JOB_NAME_LENGTH: number;
    /** name of the job*/
    name: string;
    /** shell that will be used by default in this job*/
    shell: string;
    /** tasks is a list of tasks run inside of the shell*/
    tasks: string[];
    /** args is a list of arguments that will be supplied to the container.*/
    args: string[];
    /** env is the environment variables for the job*/
    env: {
        [key: string]: string | V1EnvVarSource;
    };
    /** image is the container image to be run*/
    image: string;
    /** imageForcePull defines the container image pull policy: Always if true or IfNotPresent if false */
    imageForcePull: boolean;
    /**
     * imagePullSecrets names secrets that contain the credentials for pulling this
     * image or the sidecar image.
     */
    imagePullSecrets: string[];
    /** Path to mount as the base path for executable code in the container.*/
    mountPath: string;
    /** Set the max time in miliseconds to wait for this job to complete.*/
    timeout: number;
    /** Fetch the source repo. Default: true*/
    useSource: boolean;
    /** If true, the job will be run in privileged mode.
     * This is necessary for Docker engines running inside the Job, for example.
     */
    privileged: boolean;
    /** The account identity to be used when running this job.
     * This is an optional way to override the build-wide service account. If it is
     * not specified, the main worker service account will be used.
     *
     * Different Brigade worker implementations may choose to honor or ignore this
     * for security or configurability reasons.
     *
     * See https://github.com/brigadecore/brigade/issues/251
     */
    serviceAccount?: string;
    /** Set the resource requests for the containers */
    resourceRequests: JobResourceRequest;
    /** Set the resource limits for the containers */
    resourceLimits: JobResourceLimit;
    /**
     * host expresses expectations about the host the job will run on.
     */
    host: JobHost;
    /**
     * cache controls per-Job caching preferences.
     */
    cache: JobCache;
    /**
     * storage controls this job's preferences on the build-wide storage.
     */
    storage: JobStorage;
    /**
     * docker controls the job's preferences on mounting the host's docker daemon.
     */
    docker: JobDockerMount;
    /**
     * pod annotations for the job
     */
    annotations: {
        [key: string]: string;
    };
    /** _podName is set by the runtime. It is the name of the pod.*/
    protected _podName: string;
    /** podName is the generated name of the pod.*/
    readonly podName: string;
    /** streamLogs controls whether logs from the job Pod will be streamed to output
     * this is similar to using `kubectl logs PODNAME -f`
     */
    streamLogs: boolean;
    /** Create a new Job
     * name is the name of the job.
     * image is the container image to use
     * tasks is a list of commands to run.
     */
    constructor(name: string, image?: string, tasks?: string[], imageForcePull?: boolean);
    /** run executes the job and then */
    abstract run(): Promise<Result>;
    /** logs retrieves the logs (so far) from the job run */
    abstract logs(): Promise<string>;
}
/**
 * jobNameIsValid checks the validity of a job's name.
 */
export declare function jobNameIsValid(name: string): boolean;
