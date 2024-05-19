import { UpdateRunProgressRequest } from '@activepieces/shared'
import { EngineConstants } from '../handler/context/engine-constants'
import { FlowExecutorContext } from '../handler/context/flow-execution-context'



let currentAbortController: AbortController | null = null

export const progressService = {
    sendUpdate: async (params: UpdateStepProgressParams): Promise<void> => {
        if (currentAbortController) {
            currentAbortController.abort()
        }
        currentAbortController = new AbortController()

        const { flowExecutorContext, engineConstants } = params
        const url = new URL(`${EngineConstants.API_URL}v1/worker/flows/update-run`)
        const request: UpdateRunProgressRequest = {
            runId: engineConstants.flowRunId,
            workerHandlerId: engineConstants.serverHandlerId ?? null,
            runDetails: await flowExecutorContext.toResponse(),
            progressUpdateType: engineConstants.progressUpdateType,
        }

        fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${engineConstants.workerToken}`,
            },
            body: JSON.stringify(request),
            signal: currentAbortController.signal,
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error(`Failed to send step progress: ${error}`)
            }
        })
    },
}

type UpdateStepProgressParams = {
    engineConstants: EngineConstants
    flowExecutorContext: FlowExecutorContext
}

