from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_service import scan_clothing_image

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    contents = await file.read()
    try:
        result = await scan_clothing_image(contents, file.content_type)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"status": "success", "data": result}
