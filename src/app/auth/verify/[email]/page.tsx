import VerificationForm from '../VerificationForm';

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params;
  return <VerificationForm email={decodeURIComponent(email)} />;
}
