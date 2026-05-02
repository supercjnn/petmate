"""
PetMate MVP 后端核心逻辑
决策引擎 + 风险判断 + AI解释接口
"""

from datetime import date, datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel

# === 枚举定义 ===

class StageId(str, Enum):
    S0 = "S0"  # 接猫准备期
    S1 = "S1"  # 适应期
    S2 = "S2"  # 信任建立期
    S3 = "S3"  # 行为塑造期
    S4 = "S4"  # 稳定护理期
    S5 = "S5"  # 长期优化期

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# === 模型定义 ===

class CatStatus(BaseModel):
    eating: str = "unknown"  # normal|low|none|unknown
    drinking: str = "unknown"
    litter: str = "unknown"  # normal|abnormal|none|unknown
    hiding: str = "no"  # no|sometimes|often|always
    activity: str = "normal"  # low|normal|high|unknown
    vomiting: bool = False
    diarrhea: bool = False
    sneezing: bool = False
    breathing_abnormal: bool = False

class RiskResult(BaseModel):
    level: RiskLevel
    message: str
    observe_duration: str
    escalate_conditions: list[str]

# === 阶段判断引擎 ===

STAGE_RANGES = [
    (StageId.S0, -14, 0, "接猫准备期"),
    (StageId.S1, 1, 3, "适应期"),
    (StageId.S2, 4, 14, "信任建立期"),
    (StageId.S3, 15, 30, "行为塑造期"),
    (StageId.S4, 31, 60, "稳定护理期"),
    (StageId.S5, 61, 90, "长期优化期"),
]

def get_stage(day_number: int) -> tuple[StageId, str]:
    """根据天数判断当前阶段"""
    for stage_id, start, end, name in STAGE_RANGES:
        if start <= day_number <= end:
            return stage_id, name
    return StageId.S5, "长期养护期"

def calculate_day_number(arrival_date: date, reference_date: Optional[date] = None) -> int:
    """计算猫咪到家天数"""
    if reference_date is None:
        reference_date = date.today()
    delta = (reference_date - arrival_date).days
    return delta

# === 风险判断引擎 ===

def evaluate_risk(status: CatStatus, day_number: int) -> RiskResult:
    """根据猫咪状态和天数判断风险等级"""
    
    # === 紧急风险 ===
    if status.breathing_abnormal:
        return RiskResult(
            level=RiskLevel.URGENT,
            message="呼吸异常（张嘴呼吸、呼吸急促）属于高风险信号，建议立即就医。",
            observe_duration="立即",
            escalate_conditions=["不要等待观察，直接就医"]
        )
    
    # === 高风险 ===
    if status.eating == "none":
        # 需要额外信息：持续多久
        return RiskResult(
            level=RiskLevel.HIGH,
            message="猫咪完全不进食需要重视，可能导致脂肪肝等严重问题。",
            observe_duration="不超过12小时",
            escalate_conditions=["超过48小时仍不进食建议尽快就医"]
        )
    
    if status.litter == "none":
        return RiskResult(
            level=RiskLevel.HIGH,
            message="如果超过48小时没有排泄，需要尽快咨询兽医。",
            observe_duration="12小时",
            escalate_conditions=["60小时仍未排泄升级为紧急"]
        )
    
    if status.vomiting:
        return RiskResult(
            level=RiskLevel.HIGH,
            message="呕吐需要观察频率和精神状态，多次呕吐建议尽快就医。",
            observe_duration="24小时",
            escalate_conditions=["24小时内呕吐3次以上或呕吐物带血需立即就医"]
        )
    
    # === 中等风险 ===
    if status.diarrhea:
        return RiskResult(
            level=RiskLevel.MEDIUM,
            message="腹泻应加强观察，注意补水和饮食调整。",
            observe_duration="24-48小时",
            escalate_conditions=["腹泻带血或超过48小时需咨询兽医"]
        )
    
    if status.sneezing:
        return RiskResult(
            level=RiskLevel.MEDIUM,
            message="频繁打喷嚏可能是上呼吸道问题，观察是否有眼鼻分泌物。",
            observe_duration="48小时",
            escalate_conditions=["伴随呼吸困难或精神萎靡升级高风险"]
        )
    
    # === 低风险 - 适应期特殊判断 ===
    if day_number <= 3 and status.hiding == "always":
        if status.eating != "none" and status.litter != "none":
            return RiskResult(
                level=RiskLevel.LOW,
                message="到家前3天躲藏较常见，只要进食和排泄正常，可以继续安静观察。",
                observe_duration="续观察3天",
                escalate_conditions=["第4天后仍不出来或进食变差需关注"]
            )
    
    # === 默认低风险 ===
    return RiskResult(
        level=RiskLevel.LOW,
        message="当前暂无明显高风险信号，继续按行动卡执行。",
        observe_duration="日常观察即可",
        escalate_conditions=["出现新的异常信号及时判断"]
    )

# === 每日行动卡加载 ===

def load_daily_card(day_number: int) -> dict:
    """从YAML文件加载每日行动卡内容"""
    import yaml
    from pathlib import Path
    
    content_dir = Path(__file__).parent.parent / "content" / "daily_cards"
    card_path = content_dir / f"day_{day_number:03d}.yaml"
    
    if card_path.exists():
        with open(card_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    
    # 如果文件不存在，返回默认卡片
    return {
        "day_number": day_number,
        "stage_name": "长期养护期",
        "title": "日常养护",
        "focus": "继续保持规律的生活节奏",
        "actions": [
            {"text": "保持固定的喂食时间", "reason": "稳定的生活节奏有利于猫咪健康"}
        ],
        "avoids": [
            {"text": "不要频繁更换猫粮", "reason": "突然换粮可能导致肠胃不适"}
        ],
        "observe": ["进食量", "精神状态", "排泄情况"],
        "risk_tip": "如出现持续不进食、呕吐、腹泻等症状，请及时就医",
        "shopping_tip": "可以适当添置玩具丰富生活",
        "reassurance": "你已经是一位有经验的铲屎官了",
        "followup_questions": ["有什么需要我帮忙的吗？"]
    }

def generate_personalized_card(user_id: str, cat_id: str, day_number: int, 
                               current_status: Optional[CatStatus] = None) -> dict:
    """生成个性化每日行动卡"""
    
    # 1. 加载基础行动卡
    base_card = load_daily_card(day_number)
    
    # 2. 获取阶段信息
    stage_id, stage_name = get_stage(day_number)
    base_card["stage_id"] = stage_id.value
    base_card["stage_name"] = stage_name
    
    # 3. 根据当前状态调整
    if current_status:
        risk_result = evaluate_risk(current_status, day_number)
        base_card["risk_level"] = risk_result.level.value
        base_card["risk_message"] = risk_result.message
        
        # 如果有风险，添加额外关注点
        if risk_result.level != RiskLevel.LOW:
            base_card["extra_attention"] = risk_result.escalate_conditions
    
    return base_card

# === API 接口模拟 ===

def api_get_daily_card(user_id: str, cat_id: str) -> dict:
    """API: 获取今日行动卡"""
    from datetime import date
    # 这里应该从数据库获取猫咪信息
    # 模拟：假设今天是Day 1
    return generate_personalized_card(user_id, cat_id, day_number=1)

def api_evaluate_risk(user_id: str, cat_id: str, status: CatStatus) -> RiskResult:
    """API: 风险判断"""
    # 这里应该从数据库获取猫咪到家天数
    # 模拟：假设今天是Day 2
    return evaluate_risk(status, day_number=2)

def api_ai_explain(user_id: str, question: str, context: dict) -> dict:
    """API: AI解释（调用GLM）"""
    # 这里应该调用实际的AI模型
    # 返回结构化回答
    return {
        "answer": "这是一个示例回答，实际应该调用GLM API生成。",
        "what_to_do": ["建议行动1", "建议行动2"],
        "what_not_to_do": ["不建议做法1"],
        "when_to_escalate": "什么情况下需要就医",
        "disclaimer": "本建议仅用于养宠日常决策辅助，不能替代兽医诊断。"
    }

# === 主函数示例 ===

if __name__ == "__main__":
    # 测试阶段判断
    for day in [0, 1, 3, 4, 14, 15, 30, 31, 60, 61, 90]:
        stage_id, stage_name = get_stage(day)
        print(f"Day {day}: {stage_id.value} - {stage_name}")
    
    print("\n--- 风险判断测试 ---")
    
    # 测试风险判断
    test_cases = [
        CatStatus(breathing_abnormal=True),
        CatStatus(eating="none"),
        CatStatus(hiding="always", eating="normal", litter="normal"),
        CatStatus(diarrhea=True),
    ]
    
    for status in test_cases:
        result = evaluate_risk(status, day_number=2)
        print(f"状态: {status.model_dump()}")
        print(f"结果: {result.level.value} - {result.message}\n")
