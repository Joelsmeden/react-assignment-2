import { useEffect, useState } from 'react';

type WalletProps = {
  account: string;
};

export const Wallet = ({ account }: WalletProps) => {
  const [balance, setBalance] = useState<string>('');

  const formatBalance = (rawBalance: string) => {
    return (parseInt(rawBalance) / 1000000000000000000).toFixed(5);
  };

  useEffect(() => {
    const getData = async () => {
      const balance = await window.ethereum?.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      setBalance(formatBalance(balance));
    };

    if (account === '') return;

    getData();
  }, [account]);

  return (
    <>
      <h3>Wallet for account: {account}</h3>
      <p>Balance: {balance}</p>
    </>
  );
};
