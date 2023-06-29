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
        method: 'eth_getBalance',
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

  // const decrypt = async (ipfsCid: string) => {
  //   const authSig = await LitJsSdk.checkAndSignAuthMessage({
  //     chain: 'ethereum',
  //   });
  //   const decryptedString = await LitJsSdk.decryptFromIpfs({
  //     authSig,
  //     ipfsCid,
  //     litNodeClient: window.litNodeClient,
  //   });
  //   return decryptedString;
  // };

  const decrypt = async (ipfsCid: string) => {
    try {
      const metadata = await (
        await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsCid}`)
      ).json();
      const chain = 'ethereum';
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
      const symmetricKey = await window.litNodeClient.getEncryptionKey({
        accessControlConditions: metadata.accessControlConditions,
        evmContractConditions: metadata.evmContractConditions,
        solRpcConditions: metadata.solRpcConditions,
        unifiedAccessControlConditions: metadata.unifiedAccessControlConditions,
        toDecrypt: metadata.encryptedSymmetricKeyString,
        chain,
        authSig,
      });

      console.log(symmetricKey);

      const encryptedFileBlob = new Blob(
        [Buffer.from(metadata.encryptedFile)],
        {
          type: 'application/octet-stream',
        }
      );
      const result = await LitJsSdk.decryptFile({
        file: encryptedFileBlob,
        symmetricKey,
      });
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const setUp = async () => {
      const client = new LitJsSdk.LitNodeClient({
        alertWhenUnauthorized: true,
      });
      await client.connect();
      window.litNodeClient = client;
      console.log('LitNodeClient connected');
    };

    setUp();
  }, []);

  return { encrypt, decrypt };
};

export default useLitFileProvider;
