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

One question in section 1 sends the member down one of five branches. Four of
them ask for exactly the fields their file needs, so the person on duty copies
rather than interprets. The fifth is a plain box — whatever fits none of the
four still has somewhere to go, which is what keeps the categories from being
a wall.

Help text throughout is one short clause or nothing: an example where an
example helps, silence where the question already says it. Labels are the
plain nouns a Korean form uses — 제목, 찍은 날짜, 사진 설명 — not questions
asked of the reader.

Apps Script cannot create file upload questions (there is no
`addFileUploadItem`), so the script leaves a section header in each of the
four places one belongs, addressed to the form's owner and marked 담당자용.
Add the question there, then delete the header.

**Form settings**

- Title: 동아시아학제연구회 웹사이트 요청
- Description: 웹사이트에 올릴 내용을 받는 곳입니다. 추가 문의는 조민경 (mistralwindel@gmail.com).
- 응답자 이메일 주소 수집: on — the person on duty will need to ask follow-ups.
- 응답 > 스프레드시트에 연결: on. Add two columns of your own to the right of
  the responses, `처리` (미처리 / 올림 / 보류) and `메모`.
- Confirmation message: 받았습니다. 확인하고 올리겠습니다. + the same contact line.
- Note that **file upload questions require the responder to be signed in to a
  Google account**, and the files land in the form owner's Drive. Both are
  fine here — everyone uploaded a photo to the original survey the same way.
- A form now has to be **게시**d before its link opens. The script does it if
  the runtime offers `setPublished`; if the log says otherwise, press it in the
  editor before sending the link anywhere.

### Section 1 · 시작

| Question | Type | Required |
| --- | --- | --- |
| 이름 | 단답형 | yes |
| 무엇을 보내시나요? | 객관식 · 답변을 기준으로 섹션 이동 | yes |

Options, each jumping to its own section: 소식 / 사진 / 내 프로필 수정 /
발제 요약 / 그 밖의 것. Every section ends with 양식 제출.

### Section 2 · 소식 → `_posts/YYYY-MM-DD-제목.md`

| Question | Type | Req. | Help text | Feeds |
| --- | --- | --- | --- | --- |
| 제목 | 단답형 | yes | 예: 은교, 찬희, 나현, 채연의 논문이 DH2026에 채택되었습니다! | `title` |
| 소식이 있었던 날짜 | 날짜 | yes | | filename + `date` |
| 본문 | 장문형 | yes | 문단은 빈 줄로 나눠주세요. | body |
| 홈에 실릴 한 줄 요약 | 단답형 | no | 비워두면 본문 첫 문장을 씁니다. | `summary` |
| 영어 번역 (제목 · 요약 · 본문) | 장문형 | no | 없으면 한국어가 그대로 나갑니다. | `title_en`, `summary_en`, `content_en` |
| 함께 올릴 사진 | 파일 업로드 · 이미지 · 최대 10개 | no | 사람이 나온 사진은 동의를 받은 것만 올려주세요. | 갤러리 |

### Section 3 · 사진 → `_data/gallery.yml` + `assets/images/gallery/`

| Question | Type | Req. | Help text | Feeds |
| --- | --- | --- | --- | --- |
| 사진 | 파일 업로드 · 이미지 · 최대 20개 | yes | 휴대폰 사진은 원본 그대로 올려주세요. | the image files |
| 찍은 날짜 | 날짜 | yes | | `date` |
| 어떤 자리였나요 | 단답형 | yes | 예: DH2026, 대전 모임 | `event` |
| 사진 설명 | 장문형 | no | 올린 순서대로 한 줄씩. 예: 마이크를 잡은 채연 | `caption` |
| 영어 설명 | 장문형 | no | | `caption_en` |
| 사진에 나온 분들께 웹사이트 공개 동의를 받았습니다 | 체크박스 · 필수 | yes | | — |

The consent box is a one-option checkbox marked required, so the form will not
submit without it. That is the gallery's existing rule made mechanical. The
소식 branch can carry photographs too but cannot enforce it there — a news post
usually has none — so the rule is stated on its upload question instead.

### Section 4 · 내 프로필 수정 → `_data/people.yml`

| Question | Type | Req. | Help text |
| --- | --- | --- | --- |
| 무엇을 고칠까요 | 체크박스 | yes | 소속 / 전공 / 소개글 / 사진 / 이름 로마자 표기 / 링크(LinkedIn 등) / 내리고 싶습니다 |
| 고친 내용 | 장문형 | yes | 예: 소속: 서울대학교 정치외교학부 |
| 영어 번역 | 장문형 | no | |
| 새 사진 | 파일 업로드 · 이미지 · 1개 | no | 정사각형으로 잘라 실립니다. |

⚠️ `import_people.py` rewrites `_data/people.yml` wholesale from the survey
export, so a correction typed straight into that file is lost the next time
the importer runs. Before this section goes live, profile corrections need an
overrides file the importer cannot reach — the way `_data/people_photos.yml`
already protects the photos. Until then, treat these as needing the leader.

### Section 5 · 발제 요약 → `_seminar/YYYY-MM-DD-제목.md`

| Question | Type | Req. | Help text | Feeds |
| --- | --- | --- | --- | --- |
| 발제 제목 | 단답형 | yes | | `title` |
| 발제 날짜 | 날짜 | yes | | `date` |
| 발제자 | 단답형 | yes | | `presenter` |
| 대주제 | 단답형 | no | 예: 동아시아와 기억 | `cycle` |
| 요약 | 장문형 | yes | 문단은 빈 줄로 나눠주세요. | body |
| 영어 번역 (제목 · 요약) | 장문형 | no | | `title_en`, `content_en` |

### Section 6 · 그 밖의 것

The escape hatch, and the only section with no shape to it. Error reports,
suggestions, and anything the four categories above do not describe.

| Question | Type | Req. | Help text |
| --- | --- | --- | --- |
| 무슨 내용인가요 | 장문형 | yes | |
| 파일 | 파일 업로드 · 모든 형식 · 최대 10개 | no | 무엇이든 괜찮습니다. |
| 어느 페이지인가요 | 드롭다운 | no | 홈 / 소개 / 사람 / 발제 / 소식 / 갤러리 / 해당 없음 |

## Where the form link goes

A form nobody can find collects nothing. Once the form exists, its link
belongs in the site footer and at the foot of the 소식 and 갤러리 pages,
labelled 「소식·사진 보내기」.
