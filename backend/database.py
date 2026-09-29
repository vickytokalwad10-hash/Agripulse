import os
import logging
import asyncio
from datetime import datetime
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


logger = logging.getLogger("agripulse.database")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://sxzklpjmehfmwxahxtov.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sandbox_anon_key_agripulse_2026")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/agripulse_ai")
DB_NAME = "agripulse_ai"

# ===========================================================================
# Supabase Python Client Initialization
# ===========================================================================
supabase_client = None
try:
    from supabase import create_client, Client
    if SUPABASE_URL and SUPABASE_KEY:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase Client initialized successfully for database operations.")
except Exception as e:
    logger.warning(f"Supabase Client init notice: {e}. Resilient async store will handle operations.")


# ===========================================================================
# Resilient Asynchronous In-Memory Store & Supabase Adapter
# ===========================================================================
class InMemoryCursor:
    def __init__(self, data):
        self._data = list(data)

    def sort(self, key, direction=1):
        reverse = direction < 0
        try:
            self._data.sort(key=lambda x: x.get(key, ""), reverse=reverse)
        except Exception:
            pass
        return self

    def limit(self, n):
        self._data = self._data[:n]
        return self

    async def to_list(self, length=100):
        if length is None:
            return list(self._data)
        return list(self._data[:length])

    def __aiter__(self):
        self._iter = iter(self._data)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class TableAdapter:
    def __init__(self, name, supabase_inst=None):
        self.name = name
        self.supabase = supabase_inst
        self.documents = []

    async def find_one(self, query):
        # Try Supabase if available
        if self.supabase and not SUPABASE_URL.startswith("https://agripulse-demo"):
            try:
                builder = self.supabase.table(self.name).select("*")
                for k, v in query.items():
                    builder = builder.eq(k, v)
                res = builder.limit(1).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.debug(f"Supabase find_one fallback for {self.name}: {e}")

        # Local store
        for doc in reversed(self.documents):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, query=None):
        # Try Supabase if connected
        if self.supabase and not SUPABASE_URL.startswith("https://agripulse-demo"):
            try:
                builder = self.supabase.table(self.name).select("*")
                if query:
                    for k, v in query.items():
                        builder = builder.eq(k, v)
                res = builder.execute()
                if res.data:
                    return InMemoryCursor(res.data)
            except Exception as e:
                logger.debug(f"Supabase find fallback for {self.name}: {e}")

        if not query:
            return InMemoryCursor(self.documents)
        matched = []
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc)
        return InMemoryCursor(matched)

    async def insert_one(self, document):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        
        # Try remote Supabase insert
        if self.supabase and not SUPABASE_URL.startswith("https://agripulse-demo"):
            try:
                self.supabase.table(self.name).insert(doc_copy).execute()
            except Exception as e:
                logger.debug(f"Supabase insert fallback for {self.name}: {e}")

        self.documents.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def update_one(self, query, update):
        if self.supabase and not SUPABASE_URL.startswith("https://agripulse-demo"):
            try:
                builder = self.supabase.table(self.name)
                for k, v in query.items():
                    builder = builder.eq(k, v)
                if "$set" in update:
                    builder.update(update["$set"]).execute()
            except Exception as e:
                logger.debug(f"Supabase update fallback for {self.name}: {e}")

        target = await self.find_one(query)
        if target:
            if "$set" in update:
                for k, v in update["$set"].items():
                    target[k] = v
            return True
        return False

    async def count_documents(self, query):
        count = 0
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count


class AgriPulseDatabase:
    def __init__(self, supabase_inst=None):
        self.supabase = supabase_inst
        self.farmers = TableAdapter("farmers", supabase_inst)
        self.buyers = TableAdapter("buyers", supabase_inst)
        self.users = TableAdapter("users", supabase_inst)
        self.chat_logs = TableAdapter("chat_logs", supabase_inst)
        self.offtopic_logs = TableAdapter("offtopic_logs", supabase_inst)
        self.transactions = TableAdapter("transactions", supabase_inst)
        self.crop_listings = TableAdapter("crop_listings", supabase_inst)
        self.insurance_claims = TableAdapter("insurance_claims", supabase_inst)
        self.equipment_rentals = TableAdapter("equipment_rentals", supabase_inst)
        self.labor_posts = TableAdapter("labor_posts", supabase_inst)
        self.community_posts = TableAdapter("community_posts", supabase_inst)
        self.otp_codes = TableAdapter("otp_codes", supabase_inst)
        self._seed_default_data()

    def _seed_default_data(self):
        # Pre-seed verified B2B marketplace crop lots
        self.crop_listings.documents.extend([
            {
                "_id": "crop_lot_101",
                "listing_id": "crop_lot_101",
                "farmer_id": "farmer_dev_01",
                "farmer_name": "Ramesh Patil",
                "farmer_phone": "9876543210",
                "crop_name": "Wheat (Sharbati Gold)",
                "category": "Grains",
                "variety": "A-Grade Sharbati",
                "quantity_quintals": 120,
                "price_per_quintal": 2750,
                "total_value": 330000,
                "location": "Nashik, Maharashtra",
                "harvest_date": "2026-03-15",
                "quality_grade": "Grade A Premium",
                "moisture_pct": 11.2,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "_id": "crop_lot_102",
                "listing_id": "crop_lot_102",
                "farmer_id": "farmer_dev_02",
                "farmer_name": "Suresh Deshmukh",
                "farmer_phone": "9823114455",
                "crop_name": "Soybean (JS-335)",
                "category": "Oilseeds",
                "variety": "JS-335 Certified",
                "quantity_quintals": 85,
                "price_per_quintal": 4850,
                "total_value": 412250,
                "location": "Latur, Maharashtra",
                "harvest_date": "2026-03-20",
                "quality_grade": "Export Grade",
                "moisture_pct": 10.5,
                "status": "available",
                "created_at": datetime.now().isoformat()
            },
            {
                "_id": "crop_lot_103",
                "listing_id": "crop_lot_103",
                "farmer_id": "farmer_dev_03",
                "farmer_name": "Balwant Singh",
                "farmer_phone": "9814022334",
                "crop_name": "Basmati Rice (1121 Steam)",
                "category": "Paddy / Rice",
                "variety": "Pusa 1121",
                "quantity_quintals": 200,
                "price_per_quintal": 4200,
                "total_value": 840000,
                "location": "Karnal, Haryana",
                "harvest_date": "2026-03-10",
                "quality_grade": "Top Export Standard",
                "moisture_pct": 12.0,
                "status": "available",
                "created_at": datetime.now().isoformat()
            }
        ])


db = AgriPulseDatabase(supabase_client)

async def get_db():
    global db
    return db

def get_supabase_client():
    return supabase_client
