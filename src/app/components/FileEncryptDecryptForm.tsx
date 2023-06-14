import { useState } from 'react';
import useLitFileProvider from '../hooks/useLitFileProvider';
import { MuiFileInput } from 'mui-file-input';
import { Button, Grid, Link, FormControl, TextField } from '@mui/material';

const FileEncryptDecryptForm = () => {
  const { encrypt, decrypt } = useLitFileProvider();

  const [authorizedWalletAddress, setAuthorizedWalletAddress] = useState<
    string | null
  >(null);
  const [file, setFile] = useState<File | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [decryptedString, setDecryptedString] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    setFile(file);
  };

  const handleEncryptClick = async () => {
    if (!authorizedWalletAddress) {
      alert('Please enter an authorized wallet address');
      return;
    }
    if (file && authorizedWalletAddress) {
      const ipfsCid = await encrypt(file, authorizedWalletAddress);
      console.log(ipfsCid);
      setIpfsCid(ipfsCid);
    }
  };

  const handleDecryptClick = async () => {
    if (ipfsCid) {
      const decryptedString = await decrypt(ipfsCid);
      console.log(decryptedString);
      console.log(typeof decryptedString);
      setDecryptedString(
        typeof decryptedString === 'string'
          ? decryptedString
          : new TextDecoder().decode(decryptedString)
      );
    }
  };

  return (
    <div>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <h3>
            Authorized Wallet Address (the wallet address of who will have
            access to this file)
          </h3>
          <FormControl>
            <TextField
              placeholder="Authorized Wallet Address"
              onChange={(e) => setAuthorizedWalletAddress(e.target.value)}
            ></TextField>
          </FormControl>
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
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <p>Change your wallet account holder to the authorized wallet</p>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <Button onClick={handleDecryptClick}>Decrypt</Button>
        </Grid>
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <p>Decrypted String: {decryptedString}</p>
        </Grid>
      </Grid>
    </div>
  );
};

export default FileEncryptDecryptForm;
