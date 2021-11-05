import web3 from './web3';
import shftJson from '../contract/SHFT.json'
import config from '../config';

var shftContract;
if (web3) {
    shftContract = new web3.eth.Contract(shftJson.abi, config.SHFTTokenAddress);
}

export default shftContract;
