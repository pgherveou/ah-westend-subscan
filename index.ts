import { serve } from 'bun'

const PORT = parseInt(process.env.PORT ?? '3000')
const ETH_RPC_URL = process.env.ETH_RPC_URL ?? 'https://westend-asset-hub-eth-rpc.polkadot.io'
const SUBSCAN_URL = process.env.SUBSCAN_URL ?? 'https://assethub-westend.subscan.io/extrinsic/'

async function handleRequest(req: Request) {
	const url = new URL(req.url)
	const hash = url.pathname.slice(1)

	if (!hash) {
			return Response.redirect(SUBSCAN_URL, 302)
	}

	const rpcResponse = await fetch(ETH_RPC_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'eth_getTransactionReceipt',
			params: [hash],
			id: 1,
		}),
	})

	const json = await rpcResponse.json()

	if (!json.result) {
		return new Response('Transaction not found', { status: 404 })
	}

	const blockNumber = json.result.blockNumber
	const txIndex = json.result.transactionIndex

	if (!blockNumber || !txIndex) {
		return new Response('Failed to extract block number or transaction index', { status: 500 })
	}

	// Redirect URL
	const redirectUrl = `${SUBSCAN_URL}/${parseInt(blockNumber, 16)}-${parseInt(txIndex, 16)}`
	return Response.redirect(redirectUrl, 302)
}

// Start the server
console.log(`🚀 Starting server on port ${PORT}`)
serve({
	fetch: handleRequest,
	port: PORT,
})
