import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("agripulse.notifications")

# ============================================================================
# DATA MODELS
# ============================================================================

class NotificationItem(BaseModel):
    id: str
    user_id: str = "default_farmer"
    title: str
    desc: str
    category: str  # "weather", "price", "scheme", "marketplace", "system"
    severity: str  # "critical", "warning", "advisory", "info"
    timestamp: str
    time_ago: str
    unread: bool = True
    color_type: str = "wheat-gold"  # "crop-green", "terracotta", "wheat-gold"
    icon: str = "notifications"
    action_route: Optional[str] = None
    action_label: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NotificationSettings(BaseModel):
    user_id: str = "default_farmer"
    enable_weather_alerts: bool = True
    enable_price_alerts: bool = True
    enable_scheme_alerts: bool = True
    enable_marketplace_alerts: bool = True
    enable_sms_alerts: bool = True
    enable_push_alerts: bool = True
    recipient_mobile: str = "+91 98765 43210"
    sms_language: str = "hi"
    price_change_threshold: float = 5.0  # percentage +/- 5%
    rain_probability_threshold: int = 70  # percentage > 70%
    watchlist_crops: List[str] = Field(default_factory=lambda: ["wheat", "paddy", "mustard", "soybean", "cotton"])
    farm_location: str = "Karnal, Haryana"
    fcm_token: Optional[str] = None


# ============================================================================
# IN-MEMORY NOTIFICATION REPOSITORY WITH DEDUPLICATION COOLDOWNS
# ============================================================================

class NotificationRepository:
    def __init__(self):
        self.notifications: Dict[str, List[NotificationItem]] = {}
        self.settings: Dict[str, NotificationSettings] = {}
        self.alert_cooldowns: Dict[str, datetime] = {}
        self._seed_default_notifications()

    def _seed_default_notifications(self):
        default_user = "default_farmer"
        now = datetime.now()
        
        seed_items = [
            NotificationItem(
                id="notif-001",
                user_id=default_user,
                title="PM-KISAN 19th Installment Credited",
                desc="₹2,000 has been sanctioned for release under DBT to your linked SBI account (Aadhaar Seeded).",
                category="scheme",
                severity="info",
                timestamp=(now - timedelta(minutes=15)).isoformat(),
                time_ago="15m ago",
                unread=True,
                color_type="wheat-gold",
                icon="account_balance",
                action_route="/schemes",
                action_label="Verify PM-KISAN Ledger",
                metadata={"scheme": "PM-KISAN", "installment": "19th", "amount": 2000}
            ),
            NotificationItem(
                id="notif-002",
                user_id=default_user,
                title="Rainfall Alert: 75% Probability (45mm)",
                desc="IMD radar projects heavy unseasonal thunderstorms in Karnal district within 18h. Defer pesticide spraying & clear field drainage.",
                category="weather",
                severity="critical",
                timestamp=(now - timedelta(hours=1)).isoformat(),
                time_ago="1h ago",
                unread=True,
                color_type="terracotta",
                icon="thunderstorm",
                action_route="/weather",
                action_label="View Weather Radar",
                metadata={"rain_prob": 75, "rainfall_mm": 45, "spraying_safe": False}
            ),
            NotificationItem(
                id="notif-003",
                user_id=default_user,
                title="Sharbati Wheat Price Surged +5.4%",
                desc="Spot rate in Karnal & Khanna APMCs reached ₹2,840/qtl (+₹140 above MSP). High mill procurement demand active.",
                category="price",
                severity="advisory",
                timestamp=(now - timedelta(hours=3)).isoformat(),
                time_ago="3h ago",
                unread=True,
                color_type="crop-green",
                icon="trending_up",
                action_route="/overview",
                action_label="Check Mandi Radar",
                metadata={"crop": "wheat", "delta_pct": 5.4, "spot_price": 2840, "msp": 2425}
            ),
            NotificationItem(
                id="notif-004",
                user_id=default_user,
                title="ITC Verified Escrow Bid Placed",
                desc="ITC Agri-Business placed a 100% advance escrow-backed bid of ₹2,860/qtl on your 200 Quintal Sharbati lot.",
                category="marketplace",
                severity="advisory",
                timestamp=(now - timedelta(hours=5)).isoformat(),
                time_ago="5h ago",
                unread=False,
                color_type="crop-green",
                icon="storefront",
                action_route="/marketplace",
                action_label="Open B2B Trading Floor",
                metadata={"buyer": "ITC Agri-Business", "price_per_qtl": 2860, "lot_id": "LOT-WHT-409"}
            ),
            NotificationItem(
                id="notif-005",
                user_id=default_user,
                title="PMFBY 72-Hour Calamity Claim Window",
                desc="Reminder: For any localized unseasonal hail/crop damage, file intimation within 72 hours via photo evidence to receive immediate 25% on-account payment.",
                category="scheme",
                severity="warning",
                timestamp=(now - timedelta(hours=12)).isoformat(),
                time_ago="12h ago",
                unread=False,
                color_type="wheat-gold",
                icon="shield_with_heart",
                action_route="/schemes",
                action_label="File Crop Insurance",
                metadata={"scheme": "PMFBY", "window_hours": 72}
            )
        ]
        
        self.notifications[default_user] = seed_items
        self.settings[default_user] = NotificationSettings(user_id=default_user)

    def get_user_notifications(self, user_id: str = "default_farmer") -> List[NotificationItem]:
        if user_id not in self.notifications:
            self.notifications[user_id] = []
        return sorted(self.notifications[user_id], key=lambda x: x.timestamp, reverse=True)

    def get_user_settings(self, user_id: str = "default_farmer") -> NotificationSettings:
        if user_id not in self.settings:
            self.settings[user_id] = NotificationSettings(user_id=user_id)
        return self.settings[user_id]

    def update_user_settings(self, user_id: str, new_settings: NotificationSettings) -> NotificationSettings:
        self.settings[user_id] = new_settings
        return self.settings[user_id]

    def mark_read(self, user_id: str, notif_id: str) -> bool:
        items = self.notifications.get(user_id, [])
        for item in items:
            if item.id == notif_id:
                item.unread = False
                return True
        return False

    def mark_all_read(self, user_id: str = "default_farmer") -> int:
        items = self.notifications.get(user_id, [])
        count = 0
        for item in items:
            if item.unread:
                item.unread = False
                count += 1
        return count

    def add_notification(self, notification: NotificationItem) -> NotificationItem:
        user_id = notification.user_id
        if user_id not in self.notifications:
            self.notifications[user_id] = []
        
        # Insert at front
        self.notifications[user_id].insert(0, notification)
        logger.info(f"🔔 Added notification: {notification.title} for user {user_id}")
        
        # Trigger mock FCM Push & SMS Dispatch
        self._dispatch_fcm_push(notification)
        self._dispatch_sms_alert(notification)
        return notification

    def _dispatch_fcm_push(self, notification: NotificationItem):
        """Simulates/dispatches Firebase Cloud Messaging (FCM) push notification payload."""
        fcm_payload = {
            "to": f"/topics/farmer_{notification.user_id}",
            "notification": {
                "title": f"AgriPulse 🌾 {notification.title}",
                "body": notification.desc,
                "icon": "/assets/icon.png",
                "click_action": notification.action_route or "/overview"
            },
            "data": {
                "category": notification.category,
                "severity": notification.severity,
                "notif_id": notification.id
            }
        }
        logger.info(f"📱 FCM Push Dispatched: {json.dumps(fcm_payload)}")

    def _dispatch_sms_alert(self, notification: NotificationItem):
        """Simulates/dispatches DLT-compliant Indian Telecom SMS payload to farmer's mobile."""
        settings = self.get_user_settings(notification.user_id)
        if not settings.enable_sms_alerts:
            logger.info(f"SMS alert skipped: disabled by user {notification.user_id}")
            return

        sms_payload = {
            "recipient": settings.recipient_mobile,
            "message_id": f"SMS-DLT-{int(datetime.now().timestamp())}",
            "dlt_template_id": "1407161234567890",
            "sender_header": "AGRPUL",
            "content": f"AgriPulse {notification.category.upper()} Alert: {notification.title} - {notification.desc}",
            "delivery_status": "Delivered to Carrier via DLT Gateway",
            "sent_at": datetime.now().strftime("%d-%m-%Y %I:%M %p")
        }
        logger.info(f"📲 DLT SMS Alert Dispatched: {json.dumps(sms_payload)}")

    # ========================================================================
    # TRIGGER ENGINES WITH COOLDOWN AND DEDUPLICATION
    # ========================================================================

    def check_and_trigger_weather_alert(
        self,
        user_id: str = "default_farmer",
        rain_probability: int = 80,
        severe_flag: Optional[str] = None,
        spraying_score: int = 35
    ) -> Optional[NotificationItem]:
        settings = self.get_user_settings(user_id)
        if not settings.enable_weather_alerts:
            return None

        cooldown_key = f"weather_{user_id}_{severe_flag or 'rain'}"
        now = datetime.now()
        
        # Cooldown check: max 1 weather alert per 12 hours
        if cooldown_key in self.alert_cooldowns:
            if now - self.alert_cooldowns[cooldown_key] < timedelta(hours=12):
                logger.info(f"Weather alert suppressed by cooldown for {user_id}")
                return None

        if rain_probability >= settings.rain_probability_threshold or severe_flag or spraying_score < 40:
            notif_id = f"wth-{int(now.timestamp())}"
            
            if severe_flag == "heatwave":
                title = "Severe Heatwave Spike (+4.2°C)"
                desc = "Surface temperature projected to cross 38.5°C in Karnal. Initiate light evening irrigation immediately to protect grain filling."
                severity = "critical"
                icon = "thermostat"
            elif severe_flag == "hailstorm":
                title = "Hailstorm & Squall Warning"
                desc = "IMD issues convective squall alert over western/northern parcels. Deploy anti-hail protection where available."
                severity = "critical"
                icon = "storm"
            else:
                title = f"Rainfall Alert: {rain_probability}% Probability"
                desc = f"Heavy localized showers expected in {settings.farm_location}. Spraying Safety Score dropped to {spraying_score}/100 (Unsafe). Defer chemical spraying."
                severity = "critical"
                icon = "thunderstorm"

            item = NotificationItem(
                id=notif_id,
                user_id=user_id,
                title=title,
                desc=desc,
                category="weather",
                severity=severity,
                timestamp=now.isoformat(),
                time_ago="Just now",
                unread=True,
                color_type="terracotta",
                icon=icon,
                action_route="/weather",
                action_label="Open Weather & Spray Radar",
                metadata={"rain_prob": rain_probability, "spraying_score": spraying_score, "severe_flag": severe_flag}
            )

            self.alert_cooldowns[cooldown_key] = now
            return self.add_notification(item)

        return None

    def check_and_trigger_price_alert(
        self,
        user_id: str = "default_farmer",
        crop: str = "wheat",
        current_price: float = 2860,
        price_change_pct: float = 5.4,
        mandi: str = "Karnal APMC",
        msp: float = 2425
    ) -> Optional[NotificationItem]:
        settings = self.get_user_settings(user_id)
        if not settings.enable_price_alerts:
            return None

        if crop.lower() not in [c.lower() for c in settings.watchlist_crops]:
            return None

        cooldown_key = f"price_{user_id}_{crop.lower()}"
        now = datetime.now()

        # Cooldown check: max 1 price alert per crop every 4 hours
        if cooldown_key in self.alert_cooldowns:
            if now - self.alert_cooldowns[cooldown_key] < timedelta(hours=4):
                logger.info(f"Price alert for {crop} suppressed by 4h cooldown for {user_id}")
                return None

        if abs(price_change_pct) >= settings.price_change_threshold:
            notif_id = f"prc-{int(now.timestamp())}"
            is_up = price_change_pct > 0
            
            direction = "Surged" if is_up else "Dropped"
            color_type = "crop-green" if is_up else "terracotta"
            icon = "trending_up" if is_up else "trending_down"
            
            title = f"{crop.capitalize()} Spot Rate {direction} {price_change_pct:+.1f}%"
            desc = f"{mandi} spot rate reached ₹{current_price:,.0f}/qtl ({'+' if is_up else ''}₹{current_price - msp:,.0f} vs MSP ₹{msp:,.0f}). Realization opportunity active."

            item = NotificationItem(
                id=notif_id,
                user_id=user_id,
                title=title,
                desc=desc,
                category="price",
                severity="advisory" if is_up else "warning",
                timestamp=now.isoformat(),
                time_ago="Just now",
                unread=True,
                color_type=color_type,
                icon=icon,
                action_route="/overview",
                action_label="View Mandi Price Chart",
                metadata={"crop": crop, "delta_pct": price_change_pct, "spot_price": current_price, "msp": msp}
            )

            self.alert_cooldowns[cooldown_key] = now
            return self.add_notification(item)

        return None


# Global singleton instance
notification_service = NotificationRepository()
