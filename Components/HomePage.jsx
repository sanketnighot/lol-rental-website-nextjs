import React, {useState, useEffect} from 'react'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import {Button, Typography} from '@mui/material';
import { useAccount, useContract, useSigner, useNetwork, useConnect, useDisconnect, useSwitchNetwork } from 'wagmi'
import { rental_abi, land_abi, lord_abi } from "../Contracts/abi";
import Logo from '../Images/logo.png'
import Land from '../Images/land.png'
import Lord from '../Images/lord.jpg'
import Stack from '@mui/material/Stack';
import {getNFTs} from './Data'
import Image from 'next/image'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { landMerkle, lordMerkle } from './Utils/Merkleproof';
import axios from 'axios';
import { M_PLUS_1 } from '@next/font/google';
import { BigNumber, ethers } from "ethers";

// import Web3 from 'web3';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode !== 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

// Mainnet
export const landContractAddress = "0x339f39f2c458fb9b0053e3116e00b1f2b607ba31";
export const lordContractAddress = "0x163ccc9719139c2e0b7543738e7f0de67bba75d5";
export const rentalContractAddress = "0xca63b89db5a634ad465927ff63e0fd1495928e23";

// Goriel Testnet
// export const landContractAddress = "0x48b72b72fa3ad813362ee178c58ab59c33d8572a";
// export const lordContractAddress = "0x3373d30f1338467bf1f68b480de77d07c34c82f3";
// export const rentalContractAddress = "0x3426042A6eb767493551ECA9Bfe8f3AC85712Bfb";

const HomePage = () => {
    const [domLoaded, setDomLoaded] = useState(false);
    const [land, setLand] = useState([]);
    const [lord, setLord] = useState('');
    const [landcategory, setLandCategory] = useState([]);
    const [lordcategory, setLordCategory] = useState('');
    const [ownland, setOwnLand] = useState([]);
    const [ownlord, setOwnLord] = useState([]);   
    const [landApproved, setLandApproved] = useState(false);
    const [lordApproved, setLordApproved] = useState(false);
    const [rewardId, setRewardId] = useState([]);
    const [landLord, setLandLord] = useState([]);
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const { chain } = useNetwork();
    const { chains, switchNetwork } = useSwitchNetwork();
    const { disconnect } = useDisconnect();
    const [open, setOpen] = useState(false);

    const landContract = useContract({
    address: landContractAddress,
    abi: land_abi,
    signerOrProvider: signer,
    });

    const lordContract = useContract({
    address: lordContractAddress,
    abi: lord_abi,
    signerOrProvider: signer,
    });

    const rentalContract = useContract({
    address: rentalContractAddress,
    abi: rental_abi,
    signerOrProvider: signer,
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen(!open);
    };

    const connectWalletButton = () => {
        return (
            <>
            {connectors.map((connector) => (
            <Button
            key={connector.id}
            onClick={() => {
                if (connector.ready) {
                    connect({ connector })
                } else {
                    alert("To connect using metamask \n 1. Open this website in metamask mobile app \n 2. Click Wallet Connect below and select Metamask")
                }
                }
            }
            >
            <Typography variant="button" color="darkOrange">
            Connect {connector.name}
                {!connector.ready && ' (Open in Metamask Browser or click Wallet Connect below)'}
                {isLoading &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
            </Typography>
            </Button>
            
            ))}
            </>
        );
    };

    const disconnectWalletButton = () => {
    return (
        <>
        Connected as: {(address)} <br/>
        <Button
        onClick={() => {
            disconnect();
            }
        }
        >
        <Typography variant="button" color="red">
            Disconnect
        </Typography>
        </Button>
        </>
    );
    };

    const handleLandChange = (id, category) => {
        var l = [...land]
        var lc = [...landcategory]
        if (lord === '') {
            alert('Please select lord first');
        } else if ((lordcategory <= l.length || lordcategory <= l.length || lordcategory <= l.length) && !l.includes(id)) {
            alert('You have selected Maximum number of Lands')
        } else if (l.includes(id)) {
            const indexL = l.indexOf(id)
            l.splice(indexL, 1);
            lc.splice(indexL, 1)
        } else {
            l.push(id.toString())
            if (category === "BASIC") {
            lc.push("1")
            } else if (category === "PLATINUM") {
            lc.push("2")
            } else if (category === "PRIME") {
            lc.push("3")
            } 
        }
        setLand(l);
        setLandCategory(lc);
    };

    const handleLordChange = (id, category) => {
        setLord(id);
        if (category === "COMMON") {
            setLordCategory("1")
        } else if (category === "RARE") {
            setLordCategory("2")
        } else if (category === "MOST RARE") {
            setLordCategory("3")
        } 
        setLand([]);
        setLandCategory([]);
    };

    const approveLand = async () => {
        handleToggle()
        let approve = await landContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
            handleClose()
            return console.log(err)})
        await approve?.wait(1).then(()=>{
            setLandApproved(true);
            alert( "Lands Approved")
            return handleClose()
        }).catch((err)=>{
            alert(err.message)
            handleClose()
            return console.log(err)})
    };

    const approveLord = async () => {
        handleToggle()
        let approve = await lordContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
            handleClose()
            return console.log(err)})
        await approve?.wait(1).then(()=>{
            setLordApproved(true);
            alert( "Lords Approved")
            return handleClose()
        }).catch((err)=>{
            alert(err.message)
            handleClose()
            return console.log(err)
        })
        
    };

    const handleStake = async () => {
    if (land.length !== 0 && lord !== '') {
        handleToggle()
        const lordMerkleProof = lordMerkle(lord, lordcategory)
        var landMerkleProof1 = []
        var landMerkleProof2 = []
        var landMerkleProof3 = []
        let landCordinate = [[],[],[]]
        
        if (lordcategory === "1") {
            ownland.map(async (item) => {
                let nX = item.rawMetadata.x
                let nY = item.rawMetadata.y

                if (nX < 0) {
                    nX = 5000 - nX
                }

                if (nY < 0) {
                    nY = 5000 - nY
                }

                if((item.tokenId) === land[0]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[0])
                    landMerkleProof1 = getProof
                    // console.log(landMerkleProof1)
                    landCordinate[0] = [nX.toString(),nY.toString()]
                }
            })
        } else if (lordcategory === "2") {
            ownland.map(async (item) => {
                let nX = item.rawMetadata.x
                let nY = item.rawMetadata.y

                if (nX < 0) {
                    nX = 5000 - nX
                }

                if (nY < 0) {
                    nY = 5000 - nY
                }
                if((item.tokenId) === land[0]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[0])
                    landMerkleProof1 = getProof
                    // console.log(landMerkleProof1)
                    landCordinate[0] = [nX.toString(),nY.toString()]
                }
                if((item.tokenId) === land[1]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[1])
                    landMerkleProof2 = getProof
                    // console.log(landMerkleProof2)
                    landCordinate[1] = [nX.toString(),nY.toString()]
                }
            })
        } else if (lordcategory === "3") {
            ownland.map(async(item) => {
                let nX = parseInt(item.rawMetadata.x)
                let nY = parseInt(item.rawMetadata.y)
                
                if (nX < 0) {
                    nX = 5000 - nX
                }

                if (nY < 0) {
                    nY = 5000 - nY
                }
                if((item.tokenId) === land[0]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[0])
                    landMerkleProof1 = getProof
                    // console.log(landMerkleProof1)
                    landCordinate[0] = [nX.toString(),nY.toString()]
                }
                if((item.tokenId) === land[1]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[1])
                    landMerkleProof2 = getProof
                    // console.log(landMerkleProof2)
                    landCordinate[1] = [nX.toString(),nY.toString()]
                }
                if((item.tokenId) === land[2]) {
                    const getProof = await landMerkle((nX), (nY), landcategory[2])
                    landMerkleProof3 = getProof
                    console.log(landMerkleProof3)
                    landCordinate[2] = [nX.toString(),nY.toString()]
                }
            })
        }
        await setTimeout(function(){
            console.log("Waiting ...")
       }, 2000);

        // console.log([[land,lord,landcategory,lordcategory],landCordinate,landMerkleProof1,landMerkleProof2,landMerkleProof3,lordMerkleProof])
        let owner = await rentalContract.depositLandLords([land,lord,landcategory,lordcategory],landCordinate,landMerkleProof1,landMerkleProof2,landMerkleProof3,lordMerkleProof).catch((err)=>{
        alert(err.message)
        handleClose()
        return console.log(err)
        })
        await owner?.wait(1).then(()=>{
            setLand([]);
            setLandCategory([]);
            handleClose()
            return alert( "LandLords Staked")
        }).catch((err)=>{
            alert(err.message)
            handleClose()
            return console.log(err)
        })
        
    } else {
            alert("Enter Land Id and Lord Id both to be Staked")
        }
    };

    const handleUnstake = async (id) => {
        handleToggle()
        if (confirm("Make sure you have colleted your reward before you unstake!") == true) {
        let owner = await rentalContract.withdrawLandLords(id).catch((err)=>{
            handleClose()
            alert(err.message)
            return console.log(err)
        })

        await owner?.wait(1).then(()=>{
            setLand([]);
            setLandCategory([]);
            handleClose()
            
            return alert( "LandLords UnStaked")
        }).catch((err)=>{
            alert(err.message)
            handleClose()
            return console.log(err)
        })
    } else {
        console.log(false)
        }
        
    };

    const handleClaimRewards = async (id) => {
        var claimRwd = await axios.get(`https://rental-api.lordsofthelands.io/api/getRewards?rewardId=${id}`)
        const claimableRwd = claimRwd.data.rewardAmount
        const claimed = claimRwd.data.claimed
        if (!claimed) {
            handleToggle()
            var claimRwd = await axios.post(`https://rental-api.lordsofthelands.io/api/getMerkleProof`, {rewardId: id})
            const reward = claimableRwd
            console.log(reward)
            let owner = await rentalContract.claimRewards(id, claimRwd.data, reward).catch((err)=>{
                handleClose()
                alert(err.message)
                return console.log(err)
            })

            await owner?.wait(1).then(async ()=>{
                handleClose()
                var claimRwd = await axios.post(`https://rental-api.lordsofthelands.io/api/claimRewards`, {rewardId: id})
                return alert( "Rewards Claimed")
            }).catch((err)=>{
                handleClose()
                alert(err.message)
                return console.log(err)
            })
        } else {
            alert('You have already Claimed the Rewards')
        }
        
    };

    const LandLordComp = (props) => {
    return(
        <Grid item sm={10} key = {(props.item.lordId).toString()} style={{marginBottom:"2%"}}>
        <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
        <h2>LandLord #{props.item.rewardId}</h2>
            <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={0.5}>
            <div style={{backgroundColor:"transparent", color:"white"}}>
                <b>Lord ID</b><br/>
                {Number(props.item.lordId)}
            </div>
            <div style={{backgroundColor:"transparent", color:"white"}}>
                <b>Land ID</b><br/>
                {(props.item.landId).join()}
            </div>
            {/* <div style={{backgroundColor:"transparent", color:"white"}}>
                <b>Total Reward</b><br/>
                {(props.item.totalRwd)}
            </div> */}
            <div style={{backgroundColor:"transparent", color:"white"}}>
                <Button style={{margin:"1%"}} color="error" fullWidth variant="contained" onClick={()=>{handleUnstake(props.item.rewardId)}}>UnStake</Button>
                {(props.item.claimed === true)?
                <Button style={{margin:"1%"}} color="secondary" fullWidth variant="contained">Already Clamied</Button> :
                <Button style={{margin:"1%"}} color="success" fullWidth variant="contained" onClick={()=>{handleClaimRewards(props.item.rewardId)}}>Claim {(props.item.claimRwd / 1000000000000000000)} ETH</Button>
                }
                
            </div>
            </Stack>
        </Item>
        </Grid>
    )
    } ;

    useEffect(() => {
        if (!isConnected) return;
        if (chains.find((x) => x.id === chain?.id) > 0) return;
        switchNetwork && switchNetwork(1);
    }, [chain?.id, chains, isConnected, switchNetwork]);

    useEffect(()=> {
    const interval = setInterval( async () => {
        // lordMerkle()
        // landMerkle()
        if (address) {
        const landApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
        setLandApproved(landApproval)
        const lordApproval = await lordContract.isApprovedForAll(address, rentalContractAddress).catch((err)=>{
            return console.log(err)})
        setLordApproved(lordApproval)
        const rewardIdInfo = await rentalContract.getUserRewardId(address).catch((err)=>{
        return console.log(err)
        })
        setRewardId((rewardIdInfo)?.map(Number))
        const lalo = [...landLord]
        rewardId?.map(async(ll)=>{
        var lld = await rentalContract.getLandLordsInfo(ll).catch((err)=>{
                return console.log(err)
            })
        var claimRwd = await axios.get(`https://rental-api.lordsofthelands.io/api/getRewards?rewardId=${ll}`)
        var claimTotalRwd = await axios.get(`https://rental-api.lordsofthelands.io/api/getTotalRewards?rewardId=${ll}`)
        
        if(landLord.some(ll => ll.lordId !== lld.lordId)){
            return
        } else{
            let asd = Object.assign({selected: false}, lld);
            // console.log(claimRwd)
            asd.rewardId = ll
            asd.claimRwd = (claimRwd.data.rewardAmount)
            asd.totalRwd = (claimTotalRwd.data.rewardAmount)
            asd.claimed = (claimRwd.data.claimed)
            // asd.claimRwd = 0
            // console.log(asd)
            lalo.push(asd)
            
            }
        })
        setLandLord(lalo)
        const ownedNft = await getNFTs(address);
        setOwnLand(ownedNft[0]);
        setOwnLord(ownedNft[1]);
        }
    }, 2000);
    return () => clearInterval(interval);}
    );
  
    useEffect(() => {
      setDomLoaded(true);
    }, []);

    return (
        <>
        {domLoaded && (
            <Container>
                <Box sx={{ flexGrow: 1 }} style={{height: '100vh', overflow: 'scroll'}}>
                    <Grid container spacing={2} direction="row" justifyContent="center" alignItems="flex-start">

                    <Grid item sm={10} style={{marginTop: '1%'}}>
                        <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                        <Image src={Logo} alt="Picture of the author" width={300} />
                            <h1 style={{color:"#ffffff"}}>RENTAL DASHBOARD</h1>
                            {isConnected ? disconnectWalletButton() : connectWalletButton()} <br/>
                        </Item>
                    </Grid>

                    {(landApproved === false || landApproved === false) ?
                    <Grid item sm={10}>
                        <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                        <h3>You need to approve Lands and Lords to transfer to rental contract before staking</h3>
                        {(landApproved === false) ? <Button color="primary" variant="contained" style={{margin:'1%'}} onClick={()=>{approveLand();}}>Approve Lands</Button> : <></>}
                        {(lordApproved === false) ?<Button color="primary" variant="contained" style={{margin:'1%'}} onClick={()=>{approveLord();}}>Approve Lords</Button> : <></> }
                        <br/>
                        </Item> 
                    </Grid>: <></>}
                    <Grid item sm={10}>
                        <Item style={{backgroundColor:"#041E2F", color:"#ffffff"}}>
                        <h3>This is version 1 of Lords of the Lands Staking. Staking LandLords is stopped here. You can only claim previous rewards if you have earned any and unstake the Landlords as this will soon get deprecated.</h3>
                        <h4>You can find the version 2 of Lords of the Lands <a href="https://v2.rental.lordsofthelands.io/" style={{color: 'red'}}>here</a></h4>
                        </Item> 
                    </Grid>

                    {/* <Grid item sm={5}>
                        <Item style={{backgroundColor:"#041E2F"}}>
                        <Image src={Lord} alt="Picture of the author" width={100}/>
                        <h1 style={{color:"#fff"}}>Lords You Own</h1>
                        {ownlord.map((item, index)=>{
                            if (lord === (item.tokenId)) {
                            return <h2 style={{margin:'2%', padding:'1%', color:'lightGreen', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLordChange((item.tokenId), item.rawMetadata.attributes[6].value)}}>Lord #{parseInt(item.tokenId)} &nbsp;
                            <Chip size="small" color="success" label={item.rawMetadata.attributes[6].value}/></h2>
                            } else {
                                return <h3 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLordChange((item.tokenId), item.rawMetadata.attributes[6].value)}}>Lord #{parseInt(item.tokenId)} &nbsp;
                                <Chip size="small" style={{color:"#fff"}} label={item.rawMetadata.attributes[6]?.value} variant="outlined" /></h3>
                            }
                            })
                        }
                        </Item>
                    </Grid>

                    <Grid item sm={5}>
                        <Item style={{backgroundColor:"#041E2F"}}>
                        <Image src={Land} alt="Picture of the author" width={100}/>
                        <h1 style={{color:"#fff"}}>Lands You Own</h1>
                            {ownland.map((item, index)=>{
                            if (land.includes((item.tokenId))) {
                                return <h2 style={{margin:'2%', padding:'1%', color:'lightGreen', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLandChange((item.tokenId), (item.rawMetadata.attributes[0].value).toUpperCase())}}>Land #{item.tokenId} &nbsp;
                                <Chip size="small" color="success" label={(item.rawMetadata.attributes[0]?.value)?.toUpperCase()}/></h2>
                            } else {
                                return <h3 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLandChange((item.tokenId), (item.rawMetadata.attributes[0].value).toUpperCase())}}>Land #{item.tokenId} &nbsp;
                                <Chip size="small" style={{color:"#fff"}} label={(item.rawMetadata.attributes[0]?.value)?.toUpperCase()} variant="outlined" />
                                </h3>
                            }
                                
                            })
                            }
                        </Item>
                    </Grid>  */}

                    <br/>

                    {/* <Grid item sm={5}>
                        <div style={{backgroundColor:"transparent"}}>
                            {(landApproved === false && landApproved === false) ? <Button fullWidth variant="contained" 
                            onClick={()=>{
                            if(landApproved === false && lordApproved === false){alert("Approve Land and Lord to stake")}
                            else if(land === '' && lord === ''){alert("Enter Land and Lord to Stake")};
                            }}>Stake</Button> : <Button color="success" fullWidth variant="contained" onClick={()=>{handleStake();}}>Stake</Button>}
                        </div>
                    </Grid><br/>            */}
                    
                    {landLord.map((item, index) => {
                        return <LandLordComp item={item} key={index}/>
                    })}
                    </Grid>
                </Box>
            </Container>
        )}
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
            <CircularProgress color="inherit"/>
        </Backdrop>
    </>
    )
}

export default HomePage
