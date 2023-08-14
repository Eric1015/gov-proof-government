import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useSigner } from '@/app/helpers/wagmiHelper';

const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26
const userInfoSchemaUID =
  process.env.NEXT_PUBLIC_EAS_USER_INFO_SCHEMA_UID || '';

const useEASProvider = () => {
  const [easClient, setEasClient] = useState<EAS | null>(null);
  const signer = useSigner();

  const createAttestation = useCallback(
    async (
      schemaUid: string,
      recipient: string,
      encodedData: string
    ): Promise<string> => {
      if (!easClient) {
        return '';
      }

      const tx = await easClient.attest({
        schema: schemaUid,
        data: {
          recipient,
          expirationTime: BigInt(0),
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });

      return await tx.wait();
    },
    [easClient]
  );

  const createUserInfoAttestation = useCallback(
    async (
      recipient: string,
      isAdult: boolean,
      faceImageCid: string
    ): Promise<string> => {
      const schemaEncoder = new SchemaEncoder(
        'bool isAdult, string face_image_cid'
      );
      const encodedData = schemaEncoder.encodeData([
        { name: 'isAdult', value: isAdult, type: 'bool' },
        { name: 'face_image_cid', value: faceImageCid, type: 'string' },
      ]);
      return createAttestation(userInfoSchemaUID, recipient, encodedData);
    },
    [createAttestation]
  );

  useEffect(() => {
    if (!easClient && signer) {
      // Initialize the sdk with the address of the EAS Schema contract address
      const eas = new EAS(EASContractAddress);

      // Connects an ethers style provider/signingProvider to perform read/write functions.
      // MUST be a signer to do write operations!
      // @ts-ignore
      eas.connect(signer);

      setEasClient(eas);
    }
  }, [easClient, signer]);

  return { createUserInfoAttestation };
};

export default useEASProvider;
