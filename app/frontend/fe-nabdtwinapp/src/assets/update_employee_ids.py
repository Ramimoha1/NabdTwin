import json
from pathlib import Path

base = Path(__file__).resolve().parent
assignments = {
    'floor1.blueprint3d': ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
    'floor2.blueprint3d': ['emp-5', 'emp-6', 'emp-7', 'emp-8'],
    'floor3.blueprint3d': ['emp-9', 'emp-10', 'emp-11'],
}

for fname, ids in assignments.items():
    path = base / fname
    data = json.loads(path.read_text())
    employees = [item for item in data.get('items', []) if item.get('item_name') == 'Employee']
    if len(employees) < len(ids):
        raise SystemExit(f"Not enough employees in {fname}: have {len(employees)} need {len(ids)}")
    for item, emp_id in zip(employees, ids):
        props = item.setdefault('custom_properties', {})
        props['employeeId'] = emp_id
    path.write_text(json.dumps(data, separators=(',', ':')))
    print(f"updated {fname} with {len(ids)} employee ids")
