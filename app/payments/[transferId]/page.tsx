import { TransferFlowPage } from "@/components/banking/transfer-flow-page"

export default async function PaymentTransferPage({
  params,
}: {
  params: Promise<{ transferId: string }>
}) {
  const { transferId } = await params
  return <TransferFlowPage transferId={decodeURIComponent(transferId)} />
}
