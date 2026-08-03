import processImage from "./services/image-processing.service.js";


const testImages =[
    {
        path: "uploads/testing.jpg"

    },
    {
        path: "uploads/testing2.jpg"
    }
    
]
async function main() {

    try{
        const result = await processImage(testImages, 1, 1);
        console.log(result);
    }catch(error){
        console.error("Error in main function:", error);
    }
}

main();