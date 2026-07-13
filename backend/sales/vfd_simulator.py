import uuid
import datetime

class TRAVFDSimulator:
    @staticmethod
    def sign_receipt(sale_id, total_amount):
        """
        Simulates signing a transaction with TRA Virtual Fiscal Device API.
        In production, this would call TRA's REST API or a VFD Aggregator.
        """
        # Generate a realistic-looking TRA receipt number
        date_str = datetime.date.today().strftime("%Y%m%d")
        unique_suffix = str(uuid.uuid4().hex[:6]).upper()
        receipt_number = f"TRA{date_str}VFD{unique_suffix}"
        
        # Realistic TRA fiscal receipt verification URL
        verification_url = f"https://vfd.tra.go.tz/verify/{receipt_number}?amt={total_amount}"
        
        return {
            "status": "SUCCESS",
            "receipt_number": receipt_number,
            "verification_url": verification_url,
            "message": "Receipt fiscalized successfully by TRA VFD Simulator."
        }
