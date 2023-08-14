import { useState } from 'react';
import useLitFileProvider from '@/app/hooks/useLitFileProvider';
import { MuiFileInput } from 'mui-file-input';
import {
  Button,
  Grid,
  Link,
  FormControl,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Image from 'next/image';
import useEASProvider from '../hooks/useEASProvider';

const UserInfoForm = () => {
  const { encrypt } = useLitFileProvider();
  const { createUserInfoAttestation } = useEASProvider();

  const [recipientWalletAddress, setRecipientWalletAddress] = useState<
    string | null
  >(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAdult, setIsAdult] = useState<boolean>(false);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState<
    string | null
  >(null);
  const [attestationUid, setAttestationUid] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    setFile(file);
    if (file) {
      const previewImageUrl = URL.createObjectURL(file);
      setUploadedImagePreviewUrl(previewImageUrl);
    }
  };

  const handleIsAdultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAdult(event.target.checked);
  };

  const handleEncryptClick = async () => {
    if (!recipientWalletAddress) {
      alert('Please enter an authorized wallet address');
      return;
    }
    if (file && recipientWalletAddress) {
      const ipfsCid = await encrypt(file, recipientWalletAddress);
      setIpfsCid(ipfsCid);
    }
  };

  const handleSubmitClick = async () => {
    if (!recipientWalletAddress) {
      return;
    }
    if (!ipfsCid) {
      return;
    }
    const attestationUid = await createUserInfoAttestation(
      recipientWalletAddress,
      isAdult,
      ipfsCid
    );
    setAttestationUid(attestationUid);
  };

  return (
    <div>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <h3>Wallet Address of the user</h3>
          <FormControl>
            <TextField
              placeholder="Wallet Address"
              onChange={(e) => setRecipientWalletAddress(e.target.value)}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={isAdult}
                onChange={handleIsAdultChange}
                name="isAdult"
              />
            }
            label="Adult?"
          />
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <MuiFileInput value={file} onChange={handleFileChange} />
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <Button onClick={handleEncryptClick}>Encrypt</Button>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <p>IPFS CID: {ipfsCid}</p>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <Link href={`https://ipfs.io/ipfs/${ipfsCid}`}>Link on IPFS</Link>
        </Grid>
        {uploadedImagePreviewUrl && (
          <Grid item xs={12} justifyContent="center" alignItems="center">
            <Image
              src={uploadedImagePreviewUrl}
              alt="Uploaded Image"
              width={100}
              height={100}
            />
          </Grid>
        )}
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <Button onClick={handleSubmitClick}>Submit</Button>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <p>Created attestation: {attestationUid}</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default UserInfoForm;
