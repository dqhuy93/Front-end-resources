1. git checkout {commitId}

Checkout qua brand(commitId} mà không cần phải tạo brand khác, revert code ,...

Thuận tiện khi muốn kiểm tra nhanh code tại commitId để debug

2. git revert {commitId}

https://www.30secondsofcode.org/git/s/undo-commit-without-rewriting-history/

Sẽ không làm thay đổi lịch sử commit

Revert code tại điểm TRƯỚC {commitId}. Nếu có phát sinh conflict thì sẽ show ra (những file thay đổi từ {commitId trở lên sẽ bị revert lại}), giải quyết conflict bằng git revert --continute

Dùng lệnh trên sẽ tạo ra 1 commit mới, chứa các file liên quan đến thông tin bị revert.

```bash
git revert HEAD
# Reverts the last commit and creates a new commit
# with the inverse of its changes
```

3. git reset --soft or --hard {commitId}

https://www.30secondsofcode.org/git/s/rewind-to-commit/#rewind-back-n-commits

```bash
# Syntax: git reset [--hard] <commit>

git reset 3050fc0
# Rewinds back to `3050fc0` but keeps changes in the working directory

git reset --hard c0d30f3
# Rewinds back to `c0d30f3` and deletes changes
```

OR : You can also use git reset to rewind back a given number of commits. To do so, you can use the HEAD~<n> syntax, where <n> is the number of commits you want to rewind back.

```base
# Syntax: git reset [--hard] HEAD~<n>

git reset HEAD~5
# Rewinds back 5 commits but keeps changes in the working directory

git reset --hard HEAD~3
# Rewinds back 3 commits and deletes changes
```

4. git reflog

https://www.30secondsofcode.org/git/s/view-undo-history/

Show list commitId để chọn revert tại điểm nào nếu muốn

```bash
git reflog
# b6a4f9d6ff9 (HEAD -> patch-1, origin/patch-1) HEAD@{0}: Update docs
# 3050fc0de HEAD@{1}: rebase -i (finish): returning to refs/heads/patch-1
# 3050fc0de HEAD@{2}: rebase -i (pick): Fix network bug
# 93df3f495 (origin/patch-2) HEAD@{3}: rebase -i (start): checkout origin/master
# 69beaeabb HEAD@{4}: rebase -i (finish): returning to refs/heads/patch-1
```

After you've found the commit you want, you can use git reset to go back to it.

```base
git reset --hard 3050fc0de
# Go back to the commit with the given hash
```
