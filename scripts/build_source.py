"""One-off: merge identified perfumes (ids.tsv) with Telegram export order/prices into data/catalog-source.tsv."""
import csv, json, sys
ids_path, items_path, out_path = sys.argv[1:4]
items = {c['idx']: c for c in json.load(open(items_path, encoding='utf-8'))}
rows = []
for line in open(ids_path, encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    idx = int(p[0])
    if p[1].startswith('DUP:'):
        continue  # same perfume already listed earlier
    it = items[idx]
    rows.append({
        'idx': idx, 'brand': p[1], 'name': p[2], 'gender': p[3],
        'price_usd_10ml': it['price_usd'], 'photo': it['photo'],
        'check': 'yes' if len(p) > 4 and p[4] == 'CHECK' else '',
    })
with open(out_path, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter='\t')
    w.writeheader(); w.writerows(rows)
print(len(rows), 'products')
