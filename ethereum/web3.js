import Web3 from "web3";
 
let web3;
// the belo;w is to check if we are running the code inside a browser or not.  if window is undefined, we are not in a browser
 
if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider(
    'https://goerli.infura.io/v3/bb8259febfea4646abbbd08627972eb5'  // accessing the goerli network via infura.  (check previous lectures about providers and infura)
  );
  web3 = new Web3(provider); // depending on the cases above we will create an instance of web3 with the right paramenters to run either on the 
  // browser or on the next server
}
 
export default web3;
