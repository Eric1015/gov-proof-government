import UserInfoForm from '@/app/components/UserInfoForm';
import { Container, Grid } from '@mui/material';
import { Web3Button, Web3NetworkSwitch } from '@web3modal/react';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Container>
        <Grid container justifyContent="center">
          <Grid xs={4} item>
            <Web3Button icon="show" label="Connect Wallet" balance="show" />
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          <Grid xs={4} item>
            <Web3NetworkSwitch />
          </Grid>
        </Grid>
      </Container>
      {isConnected && <UserInfoForm />}
    </main>
  );
}
