with open('projects.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

assert 'data-folder="kung fu"' in content, 'Missing data-folder on canvas'
assert '<script src="script.js"></script>' in content, 'Missing script.js tag'
assert 'setupProjectCarousel' in content, 'Missing carousel logic'
assert 'initProjectFilters' in content, 'Missing filter logic'
print('projects.html validation passed successfully!')
