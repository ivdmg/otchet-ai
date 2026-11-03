"""Versioned server authority. Prices and bonuses are integer hundredths.
All front matter, contents and references count toward requested pages.
"""
VERSION = "personal-2026-11-v2"
CATALOG = {
    "abstract": {"price":19900,"max_pages":10,"default_pages":10,"max_input_tokens":2000,"max_output_tokens":2400,"repair_attempts":2,"budget":24000},
    "coursework": {"price":49000,"max_pages":25,"default_pages":25,"max_input_tokens":2000,"max_output_tokens":2400,"repair_attempts":2,"budget":60000},
    "vkr": {"price":139000,"max_pages":80,"default_pages":60,"max_input_tokens":2000,"max_output_tokens":2400,"repair_attempts":2,"budget":150000},
}

MATERIALS_BPS = 1000


def quote_price(kind, settings):
    base = CATALOG[kind]['price']
    extra = (base*MATERIALS_BPS+9999)//10000 if settings.get('include_materials') else 0
    return {'base_kopecks':base,'materials_kopecks':extra,'price_kopecks':base+extra,'materials_bps':MATERIALS_BPS}


def budget(kind, pages, include_materials=False):
    value = min(CATALOG[kind]["budget"], max(14000, pages*2200+7000))
    return (value*110+99)//100 if include_materials else value
