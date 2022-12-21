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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode !== 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

export const landContractAddress = "0x386b362d28a417ef173759be763812c02f7d3d30";
export const lordContractAddress = "0x3373d30f1338467bf1f68b480de77d07c34c82f3";
export const rentalContractAddress = "0xA2470F90Ab041b19C4aEe66083de3Dd67173A6F6";

const HomePage = () => {
    const [domLoaded, setDomLoaded] = useState(false);
    const [land, setLand] = useState([]);
    const [lord, setLord] = useState('');
    const [landcategory, setLandCategory] = useState([]);
    const [lordcategory, setLordCategory] = useState('');
    const [ownland, setOwnLand] = useState([]);
    const [ownlord, setOwnLord] = useState([]);    
    const [ownlandcategory, setOwnLandcategory] = useState([]);
    const [ownlordcategory, setOwnLordcategory] = useState([]);    
    const [landApproved, setLandApproved] = useState(false);
    const [lordApproved, setLordApproved] = useState(false);
    const [reward, setReward] = useState(0);
    const [poolId, setPoolId] = useState('');
    const [rewardId, setRewardId] = useState([]);
    const [landLord, setLandLord] = useState([]);
    const [currentAccount, setCurrentAccount] = useState(null);
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
            l.push(id)
            if (category === "BASIC") {
            lc.push(1)
            } else if (category === "PLATINUM") {
            lc.push(2)
            } else if (category === "PRIME") {
            lc.push(3)
            } 
        }
        setLand(l);
        setLandCategory(lc);
    };

    const handleLordChange = (id, category) => {
        setLord(id);
        if (category === "COMMON") {
            setLordCategory(1)
        } else if (category === "RARE") {
            setLordCategory(2)
        } else if (category === "MOST RARE") {
            setLordCategory(3)
        } 
        setLand([]);
        setLandCategory([]);
    };

    const approveLand = async () => {
        handleToggle()
        let approve = await landContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
            handleClose()
            return console.log(err)})
        await approve.wait(1).then(()=>{
            setLandApproved(true);
            alert( "Lands Approved")
            return handleClose()
        }).catch((err)=>{
            alert( "An Error Occured, Please Try Again")
            handleClose()
            return console.log(err)})
    };

    const approveLord = async () => {
        handleToggle()
        let approve = await lordContract.setApprovalForAll(rentalContractAddress, true).catch((err)=>{
            handleClose()
            return console.log(err)})
        await approve.wait(1).then(()=>{
            setLordApproved(true);
            alert( "Lords Approved")
            return handleClose()
        }).catch((err)=>{
            alert( "An Error Occured, Please Try Again")
            handleClose()
            return console.log(err)
        })
        
    };

    const handleStake = async () => {
    if (land.length !== 0 && lord !== '') {
        handleToggle()
        let owner = await rentalContract.depositLandLords(land, lord, landcategory, lordcategory).catch((err)=>{
        alert( "An Error Occured, Please Try Again")
        handleClose()
        return console.log(err)
        })
        await owner.wait(1).then(()=>{
            setLand([]);
            setLandCategory([]);
            handleClose()
            return alert( "LandLords Staked")
        }).catch((err)=>{
            alert( "An Error Occured, Please Try Again")
            handleClose()
            return console.log(err)
        })
        
    } else {
            alert("Enter Land Id and Lord Id both to be Staked")
        }
    };

    const handleUnstake = async (id) => {
        handleToggle()
        let owner = await rentalContract.withdrawLandLords(id).catch((err)=>{
            handleClose()
            alert("An Error Occured, Please Try Again")
            return console.log(err)
        })

        await owner.wait(1).then(()=>{
            setLand([]);
            setLandCategory([]);
            handleClose()
            return alert( "LandLords UnStaked")
        }).catch((err)=>{
            alert( "An Error Occured, Please Try Again")
            handleClose()
            return console.log(err)
        })
        
    };

    const handleClaimRewards = async (id) => {
        handleToggle()
        let owner = await rentalContract.claimRewards(id).catch((err)=>{
            handleClose()
            alert( "An Error Occured, Please Try Again")
            return console.log(err)
        })

        await owner.wait(1).then(()=>{
            handleClose()
            return alert( "Rewards Claimed")
        }).catch((err)=>{
            handleClose()
            alert( "An Error Occured, Please Try Again")
            return console.log(err)
        })
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
            <div style={{backgroundColor:"transparent", color:"white"}}>
                <Button style={{margin:"1%"}} color="error" fullWidth variant="contained" onClick={()=>{handleUnstake(props.item.rewardId)}}>UnStake</Button>
                <Button style={{margin:"1%"}} color="success" fullWidth variant="contained" onClick={()=>{handleClaimRewards(props.item.rewardId)}}>Claim {(props.item.claimRwd)} ETH</Button>
            </div>
            </Stack>
        </Item>
        </Grid>
    )
    } ;

    useEffect(() => {
    if (!isConnected) return;
    if (chains.find((x) => x.id === chain?.id) > 0) return;
    switchNetwork && switchNetwork(5);
    }, [chain?.id, chains, isConnected, switchNetwork]);

    useEffect(()=> {
    const interval = setInterval( async () => {
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
        var claimRwd = await rentalContract.getcalculateRewards(ll).catch((err)=>{
                return console.log(err)
            })
        
        if(landLord.some(ll => ll.lordId !== lld.lordId)){
            return
        } else{
            let asd = Object.assign({selected: false}, lld);
            console.log(claimRwd)
            asd.rewardId = ll
            asd.claimRwd = (Number(claimRwd[0])/1000000000000000000).toFixed(18)
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
    }, 5000);
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

                    <Grid item sm={5}>
                        <Item style={{backgroundColor:"#041E2F"}}>
                        <Image src={Lord} alt="Picture of the author" width={100}/>
                        <h1 style={{color:"#fff"}}>Lords You Own</h1>
                        {ownlord.map((item, index)=>{
                            if (lord === parseInt(item.tokenId)) {
                            return <h2 style={{margin:'2%', padding:'1%', color:'lightGreen', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLordChange(parseInt(item.tokenId), item.rawMetadata.attributes[6].value)}}>Lord #{parseInt(item.tokenId)} &nbsp;
                            <Chip size="small" color="success" label={item.rawMetadata.attributes[6].value}/></h2>
                            } else {
                                return <h3 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLordChange(parseInt(item.tokenId), item.rawMetadata.attributes[6].value)}}>Lord #{parseInt(item.tokenId)} &nbsp;
                                <Chip size="small" style={{color:"#fff"}} label={item.rawMetadata.attributes[6].value} variant="outlined" /></h3>
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
                            if (land.includes(parseInt(item.tokenId))) {
                                return <h2 style={{margin:'2%', padding:'1%', color:'lightGreen', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLandChange(parseInt(item.tokenId), (item.rawMetadata.attributes[0].value).toUpperCase())}}>Land #{item.tokenId} &nbsp;
                                <Chip size="small" color="success" label={(item.rawMetadata.attributes[0].value).toUpperCase()}/></h2>
                            } else {
                                return <h3 style={{margin:'2%', padding:'1%', color:'#fff', cursor: 'pointer', textAlign:"left"}} key={index} onClick={()=>{handleLandChange(parseInt(item.tokenId), (item.rawMetadata.attributes[0].value).toUpperCase())}}>Land #{item.tokenId} &nbsp;
                                <Chip size="small" style={{color:"#fff"}} label={(item.rawMetadata.attributes[0].value).toUpperCase()} variant="outlined" /></h3>
                            }
                                
                            })
                            }
                        </Item>
                    </Grid> <br/>

                    <Grid item sm={5}>
                        <div style={{backgroundColor:"transparent"}}>
                            {(landApproved === false && landApproved === false) ? <Button fullWidth variant="contained" 
                            onClick={()=>{
                            if(landApproved === false && lordApproved === false){alert("Approve Land and Lord to stake")}
                            else if(land === '' && lord === ''){alert("Enter Land and Lord to Stake")};
                            }}>Stake</Button> : <Button color="success" fullWidth variant="contained" onClick={()=>{handleStake();}}>Stake</Button>}
                        </div>
                    </Grid><br/>           
                    
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
