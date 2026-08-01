export const uploadPhotos = (req, res)=>{
   console.log(req.files);

   res.json({
    success:true,
    body: `Backend got ${JSON.stringify(req.body)}`,
    files: req.files
   })
   console.log(req.body);
}