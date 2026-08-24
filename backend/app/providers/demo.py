import asyncio
import math
import random
from typing import AsyncGenerator, List, Optional
from app.providers.base import AIProvider


class DemoProvider(AIProvider):
    def __init__(self, target_provider_id: str = "demo", target_name: str = "OmniAI Core", target_model: str = "omni-3.5-flash"):
        self.provider_id = target_provider_id
        self.name = target_name
        self.model_name = target_model
        self.capabilities = ["general", "coding", "writing", "reasoning", "research", "data_analysis"]
        self.is_configured = False
        self.is_demo = True

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        await asyncio.sleep(0.3)
        return self._build_demo_response(prompt, context)

    async def stream(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> AsyncGenerator[str, None]:
        full_text = self._build_demo_response(prompt, context)
        words = full_text.split(" ")
        chunk_size = 4
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size])
            if i > 0:
                chunk = " " + chunk
            yield chunk
            await asyncio.sleep(0.04)

    async def embed(self, text: str) -> List[float]:
        seed = sum(ord(c) for c in text)
        random.seed(seed)
        vec = [random.uniform(-1.0, 1.0) for _ in range(384)]
        norm = math.sqrt(sum(x*x for x in vec))
        return [x / norm for x in vec]

    async def health_check(self) -> bool:
        return True

    def _build_demo_response(self, prompt: str, context: Optional[str] = None) -> str:
        prompt_lower = prompt.lower()
        context_str = f"\n\n**Retrieved Knowledge Context:**\n{context}\n" if context else ""

        if "mail" in prompt_lower or "email" in prompt_lower or "write" in prompt_lower:
            return (
                f"### Professional Email Draft ({self.name}){context_str}\n\n"
                "**Subject:** Project Status Update & Strategic Next Steps\n\n"
                "Dear Team,\n\n"
                "I hope this email finds you well.\n\n"
                "I am writing to share a brief update on our current project milestones. Over the past week, we have successfully integrated multi-provider AI model orchestration and optimized our background retrieval pipelines.\n\n"
                "**Key Highlights:**\n"
                "- High-throughput non-blocking asynchronous execution.\n"
                "- Fault-tolerant provider abstraction layer.\n"
                "- RAG document intelligence & vector similarity context.\n\n"
                "Please review the attached notes and let me know if you have any questions or feedback before our sync tomorrow.\n\n"
                "Best regards,\n\n"
                "**OmniAI Engineering Lead**\n\n"
                f"*(Generated via {self.name} Demo Mode — Set API key in `.env` for live LLM output)*"
            )

        elif "bmw" in prompt_lower or "s1000rr" in prompt_lower or "bike" in prompt_lower or "car" in prompt_lower:
            model_name = "BMW S1000RR"
            for word in prompt.split():
                clean_word = word.strip("?,.!-").lower()
                if clean_word not in ["what", "is", "a", "the", "tell", "me", "about", "cost", "buying", "price", "bmw"]:
                    if len(clean_word) > 1:
                        model_name = f"BMW {word.upper()}"
                        break

            # Check if user prompt is querying a car
            is_car = any(x in prompt_lower for x in ["m2", "m3", "m4", "m5", "i8", "sedan", "coupe", "car", "suv"])
            if is_car:
                is_m3 = "m3" in prompt_lower
                is_m2 = "m2" in prompt_lower
                engine = "3.0L twin-turbocharged inline-6"
                hp = "~503 HP @ 6,250 RPM" if is_m3 else ("~453 HP @ 6,250 RPM" if is_m2 else "~382 HP")
                torque = "479 lb-ft @ 2,750 RPM" if is_m3 else ("406 lb-ft @ 2,650 RPM" if is_m2 else "369 lb-ft")
                top_speed = "~180 mph (290 km/h)"
                weight = "~3,890 lbs (1,765 kg)" if is_m3 else "~3,720 lbs (1,687 kg)"
                category = "Sports Sedan" if is_m3 else "Sports Coupe"
                
                return (
                    f"### {model_name} Overview ({self.name}){context_str}\n\n"
                    f"The **{model_name}** is a flagship high-performance {category} engineered by BMW M Division.\n\n"
                    "#### Key Performance Specifications:\n"
                    f"- **Engine**: {engine}\n"
                    f"- **Horsepower**: {hp}\n"
                    f"- **Torque**: {torque}\n"
                    f"- **Top Speed**: {top_speed}\n"
                    f"- **Weight**: {weight}\n\n"
                    "#### Key Highlights:\n"
                    "1. **M TwinPower Turbo**: High-revving power delivery with track-ready cooling and oil supply systems.\n"
                    "2. **Adaptive M Suspension**: Electronic dampers custom tune steering geometries and chassis dynamics in real-time.\n"
                    "3. **Premium Cockpit**: Features M sport seats, carbon fiber trims, and double-slat kidney grilles.\n\n"
                    f"*(Generated via {self.name} Demo Mode — Set API key in `.env` for live LLM output)*"
                )

            is_gs = "gs" in prompt_lower or "adventure" in prompt_lower
            is_450 = "450" in prompt_lower
            
            engine = "450cc parallel-twin liquid-cooled" if is_450 else "999cc inline 4-cylinder with BMW ShiftCam technology"
            hp = "~47 HP @ 8,500 RPM" if is_450 else "~205 HP @ 13,000 RPM"
            torque = "32 lb-ft @ 6,000 RPM" if is_450 else "83 lb-ft @ 11,000 RPM"
            top_speed = "~100 mph (160 km/h)" if is_450 else "> 186 mph (300 km/h)"
            weight = "~385 lbs (175 kg wet)" if is_450 else "~434 lbs (197 kg wet)"
            category = "Adventure Touring" if is_gs else "Superbike"

            return (
                f"### {model_name} Overview ({self.name}){context_str}\n\n"
                f"The **{model_name}** is a flagship high-performance {category} motorcycle engineered by BMW Motorrad.\n\n"
                "#### Key Performance Specifications:\n"
                f"- **Engine**: {engine}\n"
                f"- **Horsepower**: {hp}\n"
                f"- **Torque**: {torque}\n"
                f"- **Top Speed**: {top_speed}\n"
                f"- **Weight**: {weight}\n\n"
                "#### Key Highlights:\n"
                f"1. **Modern Engineering**: Designed as a perfect balance between everyday accessibility and highway capability.\n"
                f"2. **Advanced Electronics**: Riding modes, ABS Pro, and traction control custom tuned for the {category} segment.\n"
                f"3. **Premium Design**: Built with BMW's signature aggressive style lines and lightweight frame geometries.\n\n"
                f"*(Generated via {self.name} Demo Mode — Set API key in `.env` for live LLM output)*"
            )

        elif "code" in prompt_lower or "python" in prompt_lower or "react" in prompt_lower or "api" in prompt_lower:
            return (
                f"### Engineering Solution by {self.name}{context_str}\n\n"
                "Here is an optimized asynchronous implementation pattern:\n\n"
                "```python\n"
                "# OmniAI Production Service Pattern\n"
                "import asyncio\n"
                "from typing import Dict, Any\n\n"
                "class EngineeringService:\n"
                "    def __init__(self, name: str):\n"
                "        self.name = name\n\n"
                "    async def execute_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:\n"
                "        await asyncio.sleep(0.1)\n"
                "        return {'status': 'success', 'processed': payload, 'engine': self.name}\n"
                "```\n\n"
                f"*(Generated via {self.name} Demo Mode — Set API key in `.env` for live LLM output)*"
            )

        else:
            return (
                f"### Response from {self.name} ({self.model_name}){context_str}\n\n"
                f"Here is a comprehensive breakdown for **'{prompt}'**:\n\n"
                "1. **Analysis**: OmniAI classified your request and routed it to the optimal model pipeline.\n"
                "2. **Recommendation**: Cross-reference facts across models using Compare Mode to ensure accuracy.\n"
                "3. **Execution**: Fast response generation with clean markdown formatting.\n\n"
                f"*(Generated via {self.name} Demo Mode — Set API key in `.env` for live LLM output)*"
            )
