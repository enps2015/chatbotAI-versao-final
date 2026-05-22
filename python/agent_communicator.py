import json
import random
import sys
import os
from pathlib import Path


def load_config() -> dict:
    config_path = Path(__file__).with_name("agent_prompt_config.json")
    if not config_path.exists():
        return {
            "agent_name": "Consultora",
            "company_name": "SeguroAuto AI",
            "intro": "Olá! Seja bem-vindo(a).",
            "consent_text": "Ao seguir, você autoriza o uso dos dados para contato e cotação.",
            "friendly_bridges": ["Perfeito."],
            "missing_data_intro": "Preciso confirmar alguns dados.",
            "routing_success": "Triagem concluída.",
            "protocol_line": "Protocolo: {protocol}.",
            "compliance_line": "A cotação final depende da análise da seguradora.",
            "fallback_question": "Pode me contar mais?",
        }
    return json.loads(config_path.read_text(encoding="utf-8"))


def load_main_system_prompt(config: dict) -> str:
    prompt_file = config.get("system_prompt_file", "system_prompt_lia.txt")
    prompt_path = Path(__file__).with_name(str(prompt_file))
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    return ""


def resolve_style_config(config: dict, payload: dict) -> dict:
    styles = config.get("styles")
    if not isinstance(styles, dict):
        return config

    payload_style = payload.get("agentStyle")
    env_style = os.getenv("AGENT_VOICE_STYLE")
    default_style = config.get("default_style", "consultiva")
    selected_style = payload_style or env_style or default_style

    selected = styles.get(selected_style)
    if not isinstance(selected, dict):
        selected = styles.get(default_style) or next(iter(styles.values()))

    shared = config.get("shared", {})
    if isinstance(shared, dict):
        merged = {**shared, **selected}
        return merged

    return selected


def choose_bridge(config: dict, first_name: str = "") -> str:
    bridges = config.get("friendly_bridges", [])
    if not bridges:
        return ""
    bridge = random.choice(bridges)
    if first_name and not bridge.endswith(f", {first_name}."):
        bridge = bridge.rstrip(".") + f", {first_name}."
    return bridge


def is_small_talk(text: str) -> bool:
    normalized = (text or "").strip().lower()
    if not normalized:
        return True
    small_talk_tokens = [
        "oi",
        "ola",
        "olá",
        "tudo bem",
        "bom dia",
        "boa tarde",
        "boa noite",
    ]
    return any(token in normalized for token in small_talk_tokens) and len(normalized) <= 40


def build_reply(payload: dict, config: dict) -> str:
    stage = payload.get("stage") or "collecting"
    off_topic = bool(payload.get("offTopic"))
    collecting_transition = bool(payload.get("collectingTransition"))
    faq_answer = payload.get("faqAnswer")
    question = payload.get("question")
    missing_label = payload.get("missingLabel")
    first_missing_label = payload.get("firstMissingLabel")
    missing_count = int(payload.get("missingCount") or 0)
    context_snippet = payload.get("contextSnippet")
    assigned = payload.get("assigned")
    protocol = payload.get("protocol")
    is_routed = bool(payload.get("isRouted"))
    include_intro = bool(payload.get("includeIntro"))
    full_name = payload.get("fullName")
    first_name = full_name.split()[0] if full_name else ""

    if stage == "sinistro_handoff":
        return str(
            config.get(
                "sinistro_handoff",
                "Sinto muito pelo ocorrido. Vou te transferir agora para o time humano responsavel por sinistro.",
            )
        )

    parts = []

    if include_intro:
        parts.append(str(config.get("intro", "")))

    if faq_answer and stage not in ("collecting",):
        parts.append(str(faq_answer))

    if stage == "routed" or is_routed:
        bridge = choose_bridge(config, first_name)
        if bridge:
            parts.append(bridge)
        routing_line = str(config.get("routing_success", "")).format(
            assigned=assigned or "atendente especializado"
        )
        parts.append(routing_line)
        if context_snippet:
            parts.append(f"Resumo da sua solicitação: {context_snippet}")
        if protocol:
            parts.append(str(config.get("protocol_line", "")).format(protocol=protocol))
        parts.append(str(config.get("compliance_line", "")))
        return "\n\n".join([p for p in parts if p])

    if stage == "listening":
        if off_topic:
            return str(
                config.get(
                    "off_topic_redirect",
                    "Posso te ajudar com seguro auto. Se quiser, me diga sua principal duvida sobre seguro e seguimos por aqui.",
                )
            )

        parts.append(str(config.get("listening_intro", "")))
        if context_snippet and not is_small_talk(str(context_snippet)):
            parts.append(
                str(config.get("context_reflection", "Entendi seu contexto até aqui: {context}."))
                .format(context=context_snippet)
            )
        parts.append(str(config.get("listening_invite", "Quero te ouvir melhor antes de partir para o cadastro.")))
        return "\n".join([p for p in parts if p])

    if collecting_transition:
        # Primeira entrada na coleta: avisa o estilo e já faz a primeira pergunta.
        if faq_answer:
            parts.append(str(faq_answer))
        
        intro = str(config.get("missing_data_intro", ""))
        if first_name and intro:
            if "Ótimo!" in intro:
                intro = intro.replace("Ótimo!", f"Muito prazer, {first_name}!")
            else:
                intro = f"Muito prazer, {first_name}! {intro}"
            
        parts.append(intro)
    else:
        # Turnos seguintes: apenas uma ponte leve antes da pergunta.
        bridge = choose_bridge(config, first_name)
        if bridge:
            parts.append(bridge)

    if faq_answer and not collecting_transition:
        # Responde dúvida antes de seguir, mas só fora da transição inicial.
        parts.append(str(faq_answer))

    if question:
        parts.append(str(question))
    else:
        parts.append(str(config.get("fallback_question", "")))

    if include_intro and config.get("consent_text"):
        parts.append(str(config.get("consent_text", "")))

    return "\n".join([p for p in parts if p])


def main() -> None:
    raw = sys.stdin.read()
    payload = json.loads(raw) if raw else {}
    root_config = load_config()
    _ = load_main_system_prompt(root_config)
    style_config = resolve_style_config(root_config, payload)
    text = build_reply(payload, style_config)
    sys.stdout.write(json.dumps({"text": text}, ensure_ascii=False))


if __name__ == "__main__":
    main()
