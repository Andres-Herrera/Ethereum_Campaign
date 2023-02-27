const path = require ('path');
const solc = require ('solc');
const fs = require ('fs-extra'); // fs-extra inproved version of the standard fs(file system) module

const buildPath = path.resolve(__dirname, 'build'); //  __dirname is 2 times underscore to reference current working directory
// the 'build' argument is to actually run the script

fs.removeSync(buildPath); // deletes the specified folder and its contents

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol'); // poiting to the Campaign.sol file

const source = fs.readFileSync(campaignPath, 'utf8'); //reading from the Campaign.sol file specifying the encoding utf8

const output = solc.compile(source, 1).contracts; // since we only care from the contracts property from the output, that is why we use 
// .contracts, so we only assign thar property to the output constant

//remember that up to this point, there is no 'build' folder, as we have deleted it in the steps above, so we need to create it again

fs.ensureDirSync(buildPath);  // recreates the build folder

// Remember, the 'ouput' constant contains the output for 2 contracts, the campaign and the campaign factory contract, so we need
// to read the 'output' file 2 times to get both contracts


//console.log(output); //this is here just for education, but when you run this, you will see that the 'output' has to keys, one is
// the Campaign and the other the CampaignFactory
for (let contract in output){ // 'for in' loop is used to iterate over the keys of an object.  So when this starts, it will find the 
    // key Campaign and will assign it to 'contract' then we will call the fs.outputJSONSync function to write the contents of that
    // key to a file in the specified path.  this file will be called whatever the contract value is, in the 1st case is Campaign
    // and we will add the extension .json
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'), // this is the path and file name where we want to write
        output[contract] // this is the actual content that we want to write.  The .replace part, removes the unwanted ':' at the 
        // start of the file name  Remember, at this point in this, the property value
        // of 'cotract' is equal to Campaign.  the second iteration of the for loop this will be CampaigFactory
    )
}
