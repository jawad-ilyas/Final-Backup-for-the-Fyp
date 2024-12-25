import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';

cloudinary.config({
    cloud_name: 'jawadmughaldev',
    api_key: '273434779457487',
    api_secret: 'Gu3a2tA5-1SiWA9IGP40NNprMWU'
});


const uploadCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null;
        // console.log("cloudinary into try catch ")
        const responseFile = await cloudinary.uploader.upload(localFilePath)
        // console.log("responseFile  : ", responseFile)
        return responseFile
    } catch (error) {
        console.log("error into upload cloudinary ", error)
    }
}

const deleteCloudinary = async (localFilePath) => {
    console.log("localFilePath into delete cloudinary ", localFilePath)
    try {
        if (!localFilePath) return null;

        const filenameWithExtension = localFilePath.split('/').pop();
        console.log("filenameWithExtension ", filenameWithExtension)
        // Step 2: Remove the extension
        const filename = filenameWithExtension.split('.').slice(0, -1).join('.');
        console.log("filenameWithExtension.split('.') ", filenameWithExtension.split('.'))
        console.log("filenameWithExtension.split('.').slice(0, -1) ", filenameWithExtension.split('.').slice(0, -1))

        return await cloudinary.uploader.destroy(filename, function (error, result) {
            if (error) {
                console.log('Error deleting image:', error);
            } else {

                console.log('Image deleted successfully:', result);
                return true;
            }
        });

    } catch (error) {
        console.log("error into delete cloudinary image ", error)
    }
}

export { uploadCloudinary, deleteCloudinary }