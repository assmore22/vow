"""Seed VOW with real on-chain commitments on studionet (AI resolution)."""
from pathlib import Path

from gltest_cli.config.general import get_general_config
from gltest_cli.config.user import load_user_config
from gltest import get_contract_factory, get_default_account

ROOT = Path(__file__).resolve().parents[1]
ADDR = "0xAf68E20bCcEe499909629377363cAF34FD897dcF"
GEN = 10 ** 18
BEN = "0x431ACf85256AFcb3A8c66aff96b923366D5DdaC2"
URL = "https://example.com"

cfg = load_user_config(str(ROOT / "gltest.config.yaml"))
get_general_config().user_config = cfg
factory = get_contract_factory(contract_file_path=str(ROOT / "contracts" / "vow.py"))
c = factory.build_contract(ADDR, account=get_default_account())

VOWS = [
    ("Keep a public reference page online", "I commit to maintaining a public web page that clearly documents its own purpose and links to more information.", 2 * GEN, URL, "break"),
    ("Launch a 100-product storefront", "I promise to launch a live e-commerce store selling at least one hundred distinct products by the deadline.", 3 * GEN, URL, "break"),
    ("Run a marathon this season", "I will complete a full 42 km marathon and post the official finish-line result.", 1 * GEN, URL, "active"),
    ("Keep the Eiffel Tower encyclopedia entry live", "I commit to maintaining a published encyclopedia article that documents the Eiffel Tower, its history and its dimensions.", 2 * GEN, "https://en.wikipedia.org/api/rest_v1/page/summary/Eiffel_Tower", "break"),
    ("Maintain the canonical example domain page", "This vow is kept if the linked page is the official reserved example domain page that exists to be used for illustrative examples in documents.", 2 * GEN, URL, "keep"),
]


def main():
    have = c.get_vow_count().call()
    if have < len(VOWS):
        for (t, d, st, url, _) in VOWS[have:]:
            c.make_vow(args=[t, d, url, BEN]).transact(value=st)
            print("vowed:", t)

    for vid in range(c.get_vow_count().call()):
        plan = VOWS[vid][4] if vid < len(VOWS) else "active"
        v = c.get_vow(args=[vid]).call()
        if plan in ("keep", "break") and int(v["status"]) == 0:
            print("resolving (AI):", v["title"])
            try:
                c.resolve(args=[vid]).transact()
            except Exception as e:
                print("  resolve ->", e)

    s = c.get_stats().call()
    print("stats:", s)
    for vid in range(c.get_vow_count().call()):
        v = c.get_vow(args=[vid]).call()
        print(vid, ["ACTIVE", "KEPT", "BROKEN"][int(v["status"])], v["title"], "|", (v["rationale"] or "")[:46])


if __name__ == "__main__":
    main()
