"""
SMS & USSD Fallback Gateway Router
Provides endpoints for:
1. Pushing mandi price alerts & weather warnings via SMS to non-smartphone users
2. Simulating SMS / USSD menu dispatch

[INTEGRATION SWAP POINT]:
Replace mock dispatch with Indian Telecom DLT-registered SMS Gateway:
Providers: Twilio, Gupshup, Textlocal India, CDAC Mobile Seva (Govt Gateway)
Example Request:
requests.post("https://api.gupshup.io/sm/api/v1/msg", headers={"apikey": "<SMS_KEY>"}, data={...})
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/sms", tags=["SMS & USSD Gateway"])

class SMSAlertRequest(BaseModel):
    recipient_mobile: str
    message_type: str # Mandi_Price, Weather_Alert, Scheme_Deadline, Irrigation_Reminder
    language: str = "hi" # hi (Hindi), pa (Punjabi), mr (Marathi), en (English)
    crop_name: Optional[str] = "Wheat"
    custom_text: Optional[str] = None

sms_log_history = []

@router.post("/send-alert")
def send_sms_alert(req: SMSAlertRequest):
    """
    Dispatch SMS / USSD alert to feature phone user.
    """
    timestamp = datetime.now().strftime("%d-%m-%Y %I:%M %p")
    
    # Pre-approved DLT template payloads
    if req.custom_text:
        sms_content = req.custom_text
    elif req.message_type == "Mandi_Price":
        sms_content = f"AgriPulse Mandi Alert: Karnal Mandi Sharbati {req.crop_name or 'Wheat'} rate is Rs 2,840/qtl on {timestamp}. ITC active demand. Reply 1 for more rates."
    elif req.message_type == "Weather_Alert":
        sms_content = f"AgriPulse Mausam Alert: Heavy rainfall forecast in next 48h. Defer pesticide spraying. Reply 2 for crop advice."
    elif req.message_type == "Scheme_Deadline":
        sms_content = f"PMFBY Alert: Last date to enroll Rabi crop insurance is 31 Dec. Contact nearest CSC center or bank branch."
    else:
        sms_content = f"AgriPulse Farmer Update: Recommended CRI irrigation due in 3 days for field parcel."

    details = {
        "recipient": req.recipient_mobile,
        "message_id": f"SMS-DLT-{int(datetime.now().timestamp())}",
        "dlt_template_id": "1407161234567890",
        "sender_header": "AGRPUL",
        "content": sms_content,
        "delivery_status": "Delivered to Carrier",
        "sent_at": timestamp
    }
    
    sms_log_history.insert(0, details)

    return {
        "status": "success",
        "gateway": "Simulated DLT SMS Service (Swap with Twilio/Gupshup API in production)",
        "dispatch_details": details
    }

@router.get("/logs")
def get_sms_logs():
    """
    Retrieve history of dispatched SMS alerts.
    """
    return {
        "status": "success",
        "total": len(sms_log_history),
        "logs": sms_log_history
    }

