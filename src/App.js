import './App.css';
import { useEffect, useState } from 'react';
import { Input, Layout, message, Popconfirm, PageHeader, Button, Statistic, Row, Divider, InputNumber, Col } from 'antd';
import { ethers } from "ethers";
import { stakerAbi } from './constants';

const { Content, Footer } = Layout;

const stakerAddress = "0x76C6f2e428eb53d7D3ab818B421EdbD50b800309";
const provider = new ethers.providers.Web3Provider(window.ethereum)
async function requestAccount() {
  await provider.send("eth_requestAccounts", []);
}
requestAccount();
const signer = provider.getSigner()
const contract = new ethers.Contract(stakerAddress, stakerAbi, signer);

function App() {
  // Declare state variables
  const [stake, setStake] = useState(ethers.BigNumber.from(0));
  const [balance, setBalance] = useState(ethers.BigNumber.from(0));
  const [reward, setReward] = useState(ethers.BigNumber.from(0));
  const [inputAmount, setInputAmount] = useState(ethers.BigNumber.from(0));
  const [receiver, setReceiver] = useState("");
  const [loaded, setLoaded] = useState(false);



  useEffect(() => {
    if(!loaded){
      async function getInfo() {
        const [stake, balance, reward] = await contract.getBalances();
        setStake(stake);
        setBalance(balance);
        setReward(reward);
        setLoaded(true);
      }
      getInfo();
    }
  }, [loaded])


  const stakeRestartWarning = "This will restart the vesting period. Continue ?";

  const success = (text) => {
    message.success(text);
  };
  
  const error = (text) => {
    message.error(text);
  };

  const increaseStake = async () => {
    try{
      if(await contract.increaseStake(inputAmount)){
        setBalance(balance.sub(inputAmount));
        setStake(stake.add(inputAmount));
        success("Stake has been increased");
      }
    }catch(e){
      error(e.error.message);
    }
  };

  const decreaseStake = async () => {
    try{
      if(await contract.decreaseStake(inputAmount)){
        setBalance(balance.add(inputAmount));
        setStake(stake.sub(inputAmount));
        success("Stake has been decreased");
      }
    }catch(e){
      error(e.error.message);
    }
  };

  const claimReward = async () => {
    try{
      if(await contract.claimReward()){
        setBalance(balance.add(reward));
        setReward(ethers.BigNumber.from(0));
  
        success("Reward has been added to Balance");
      }
    }catch(e){
      error(e.error.message);
    }
  };


  const transfer = async () => {
    try{
      if(await contract.transfer(receiver,inputAmount)){
        setBalance(balance.sub(inputAmount));
        success("Transfer successful");
      }
    }catch(e){
      error(e.error.message);
    }
  };  
  
  return (
    <Layout>
    <PageHeader
      title="Staking UI"
      extra={[
        <Button key="1" onClick={() => setLoaded(false)}>Refresh</Button>,
        <Button key="2" type="primary" onClick={claimReward}>Claim Reward</Button>,
      ]}
    >
      <Row>
        <Statistic title="Balance"          
          prefix="STK"
          value={ethers.utils.formatUnits(balance)}
          style={{
            margin: '0 32px',
          }}
        />
        <Statistic
          title="Stake"
          prefix="STK"
          value={ethers.utils.formatUnits(stake)}
          style={{
            margin: '0 32px',
          }}
        /> 
        <Statistic
          title="Rewards"
          prefix="STK"
          value={ethers.utils.formatUnits(reward)}
          style={{
            margin: '0 32px',
          }}
        /> 
      </Row>
    </PageHeader>
    <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
      <Row justify="center" gutter={25}>
        <Col>
          <Row justify="center" gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
            <Col>
              <Button type="primary" onClick={transfer}>
                  Transfer
              </Button> 
            </Col>
            <Col>
              <Popconfirm placement="top" title={stakeRestartWarning} onConfirm={increaseStake} okText="Yes" cancelText="No">
                <Button type="primary">
                  Increase Stake
                </Button>
              </Popconfirm>
            </Col>
            <Col>
              <Popconfirm placement="top" title={stakeRestartWarning} onConfirm={decreaseStake} okText="Yes" cancelText="No">
                <Button type="primary">
                  Decrease Stake
                </Button>
              </Popconfirm>  
              </Col>
          </Row>
          <Divider plain>Enter an amount and Click an action</Divider>
          <Row justify="center" gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
            <Col xs={24} >
              <InputNumber 
                placeholder='Amount' 
                value={ethers.utils.formatUnits(inputAmount).toString()} 
                onChange={(value) => setInputAmount(ethers.utils.parseUnits(value))}
                stringMode
                style={{width: "100%"}}
                min="0"
                max={balance}
                step="0.000000000000000001"
                prefix="STK"
              />
            </Col>
            <Col xs={24}>
              <Input placeholder='Address(if Transfer)' 
                style={{width: "100%"}} 
                value={receiver} 
                onChange={(e) => setReceiver(e.target.value)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>Staker by Ecompudavid @Blockgames CH1</Footer>
  </Layout>
  );
}

export default App;
