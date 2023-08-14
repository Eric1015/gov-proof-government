import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { useEffect } from 'react';

const useLitFileProvider = () => {
  const encrypt = async (file: File, authorizedWalletAddress: string) => {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'ethereum',
    });
    // only allow the authorized wallet address to have access to the file contents
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: authorizedWalletAddress,
        },
      },
    ];
    const ipfsCid = await LitJsSdk.encryptToIpfs({
      authSig,
      accessControlConditions,
      chain: 'ethereum',
      file,
      litNodeClient: window.litNodeClient,
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID || '',
      infuraSecretKey: process.env.NEXT_PUBLIC_INFURA_SECRET_KEY || '',
    });
    return ipfsCid;
  };

  const decrypt = async (ipfsCid: string) => {
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: 'ethereum',
    });
    return await LitJsSdk.decryptFromIpfs({
      authSig,
      ipfsCid,
      litNodeClient: window.litNodeClient,
    });
  };

  useEffect(() => {
    const setUp = async () => {
      const client = new LitJsSdk.LitNodeClient({
        alertWhenUnauthorized: true,
        litNetwork: 'serrano',
      });
      await client.connect();
      window.litNodeClient = client;
    };

    setUp();
  }, []);

  return { encrypt, decrypt };
};

export default useLitFileProvider;
