# Maintaining the site with the group

The site is built so that no one has to be its sole owner. The work splits
into three tiers, and only the middle one touches GitHub at all.

| Who | Where they work | What they do |
| --- | --- | --- |
| Every member | a Google Form (below) | sends news, photos, profile corrections, seminar write-ups |
| Two or three on rotation | github.com, in a browser | turns each submission into a file and commits it |
| One person, a few times a year | a terminal | re-runs the survey importer, touches layouts and CSS |

A form on its own only distributes the *asking*. The rotation is what
distributes the work — without a named person on duty each month, everything
still lands on the leader.

## The intake form

Members already filled in a Google Form once (that is where `_data/people.yml`
came from), so the form is the one interface they need no explanation for. It
is Korean, works on a phone, and takes file uploads straight into Drive, which
is where `fetch_photos.py` already knows how to look.

You do not have to click it together by hand. `tools/create_form.gs` builds
the whole thing in one run — paste it into a new project at
[script.google.com](https://script.google.com), Run > `buildForm`, authorise
it, and the log prints the form's link and its response spreadsheet. Keeping
the form in a file means it can be rebuilt or revised later instead of being
a thing that exists only in someone's Drive.

**The form is loose on purpose.** A twenty-field form with everything marked
required would make the duty person's job mechanical, but in a group this size
the failure that actually happens is not a sloppy submission — it is no
submissions at all. So the first section is the entire form, and everything
after it is optional.

### Section 1 · the whole form

| Question | Type | Required |
| --- | --- | --- |
| 이름 | 단답형 | yes |
| 무엇을 올릴까요 | 장문형 | yes |
| 파일 | 파일 업로드 · 모든 형식 · 최대 20개 | no |
| 사진에 사람이 나온다면 | 체크박스 (동의 확인) | no |
| 더 알려주실 수 있나요? | 객관식 · 답변 기준 섹션 이동 | no |

Three answers and a submit button is a complete submission. Any file type is
accepted — a PDF or a 한글 file is a submission too.

Help text throughout is one short clause or nothing: an example where an
example helps, silence where the question is already clear. Forms that explain
themselves at length read as written by someone who is not in the group.

The consent checkbox is *not* required, which is a deliberate reversal: most
submissions contain no photograph, and taxing all of them to catch the few is
the wrong trade. It is worded as a plain statement so the photographs that do
need it usually arrive with it, and the duty person asks when one doesn't. The
rule itself is unchanged — a face nobody consented to does not go up.

The branch question is optional, and section 1's own navigation is 양식 제출,
so leaving it blank submits. Choosing an answer opens one refinement section:

### Section 2 · 소식 → `_posts/YYYY-MM-DD-제목.md`

All optional; the body already arrived in section 1.

| Question | Type | Help text | Feeds |
| --- | --- | --- | --- |
| 제목 | 단답형 | 예: 은교, 찬희, 나현, 채연의 논문이 DH2026에 채택되었습니다! | `title` |
| 날짜 | 날짜 | 소식이 있었던 날. | filename + `date` |
| 홈에 한 줄로 뜰 요약 | 단답형 | 비우면 본문 첫 문장을 씁니다. | `summary` |
| 영어로도 | 장문형 | 없으면 한국어가 그대로 나갑니다. | `title_en`, `content_en` |

### Section 3 · 사진 → `_data/gallery.yml` + `assets/images/gallery/`

| Question | Type | Help text | Feeds |
| --- | --- | --- | --- |
| 언제 찍은 사진인가요 | 날짜 | | `date` |
| 무슨 자리였나요 | 단답형 | 예: DH2026, 대전 모임 | `event` |
| 사진마다 한 줄 설명 | 장문형 | 올린 순서대로 한 줄에 하나. 예: 마이크를 잡은 채연 | `caption` |
| 영어로도 | 장문형 | | `caption_en` |

### Section 4 · 내 프로필 수정 → `_data/people.yml`

| Question | Type | Help text |
| --- | --- | --- |
| 무엇을 고칠까요 | 체크박스 | 소속 / 전공 / 소개글 / 사진 / 이름 로마자 표기 / 링크(LinkedIn 등) / 내리고 싶습니다 |
| 영어로도 | 장문형 | |

⚠️ `import_people.py` rewrites `_data/people.yml` wholesale from the survey
export, so a correction typed straight into that file is lost the next time
the importer runs. Before this branch is much use, profile corrections need an
overrides file the importer cannot reach — the way `_data/people_photos.yml`
already protects the photos.

### Section 5 · 발제 요약 → `_seminar/YYYY-MM-DD-제목.md`

| Question | Type | Help text | Feeds |
| --- | --- | --- | --- |
| 발제 제목 | 단답형 | | `title` |
| 발제 날짜 | 날짜 | | `date` |
| 발제자 | 단답형 | | `presenter` |
| 대주제 | 단답형 | 예: 동아시아와 기억 | `cycle` |
| 영어로도 | 장문형 | | `title_en`, `content_en` |

There is no 기타 branch. The first section already is one.

## Where the form link goes

A form nobody can find collects nothing. Once the form exists, its link
belongs in the site footer and at the foot of the 소식 and 갤러리 pages,
labelled 「소식·사진 보내기」.
