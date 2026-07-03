import sys
path = r'assets\js\lab-common.js'
with open(path, encoding='utf-8') as f:
    content = f.read()
anchor = "    'modulations-symbol': {"
tag = "'numerisation-codage-ligne'"
if tag in content:
    print('Deja present'); import sys; sys.exit(0)
if anchor not in content:
    print('ancre absente'); import sys; sys.exit(1)
blk = "    'numerisation-codage-ligne': {
      exercises: [],
      quiz: []
    },
"
new = content.replace(anchor, blk + anchor, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(new)
print('OK')
