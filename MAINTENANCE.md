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

The spec below is what that script produces, and what to check against if you
edit either. Every question is worded to collect exactly one front-matter
field, so the person on duty copies rather than interprets.

**Form settings**

- Title: 동아시아학제연구회 웹사이트 요청
- Description: 웹사이트에 올릴 소식·사진·수정 요청을 받는 곳입니다. 담당자가 확인한 뒤 반영합니다.
- 응답자 이메일 주소 수집: on — the person on duty will need to ask follow-ups.
- 응답 > 스프레드시트에 연결: on. Add two columns of your own to the right of
  the responses, `처리` (미처리 / 올림 / 보류) and `메모`.
- Confirmation message: 고맙습니다. 담당자가 확인한 뒤 웹사이트에 올립니다.
- Note that **file upload questions require the responder to be signed in to a
  Google account**, and the files land in the form owner's Drive. Both are
  fine here — everyone uploaded a photo to the original survey the same way.

### Section 1 · 시작

| Question | Type | Required |
| --- | --- | --- |
| 이름 | 단답형 | yes |
| 무엇을 보내시나요? | 객관식 · 답변을 기준으로 섹션 이동 | yes |

Options, each jumping to its own section: 소식 / 사진 / 내 프로필 수정 /
발제 요약 / 그 밖의 제안·오류 신고. Every section ends with 양식 제출.

### Section 2 · 소식 → `_posts/YYYY-MM-DD-제목.md`

| Question | Type | Req. | Help text | Feeds |
| --- | --- | --- | --- | --- |
| 제목 | 단답형 | yes | 한 줄로 써주세요. 예: 「은교, 찬희, 나현, 채연의 논문이 DH2026에 채택되었습니다!」 | `title` |
| 날짜 | 날짜 | yes | 소식이 있었던 날입니다. | filename + `date` |
| 본문 | 장문형 | yes | 문단은 빈 줄로 나눠주세요. 목록은 줄 앞에 `- ` 를 붙이면 됩니다. | body |
| 홈에 한 줄로 뜰 요약 | 단답형 | no | 비워두시면 본문 첫 문장을 씁니다. | `summary` |
| 영어로도 (제목 · 요약 · 본문) | 장문형 | no | 없으면 한국어가 두 언어 모두에 그대로 나옵니다. 오류가 아닙니다. | `title_en`, `summary_en`, `content_en` |
| 함께 올릴 사진 | 파일 업로드 · 이미지 · 최대 10개 | no | | 갤러리 |

### Section 3 · 사진 → `_data/gallery.yml` + `assets/images/gallery/`

| Question | Type | Req. | Help text | Feeds |
| --- | --- | --- | --- | --- |
| 사진 | 파일 업로드 · 이미지 · 최대 20개 | yes | 휴대폰에서 찍은 원본 그대로 올려주세요. 크기는 저희가 줄입니다. | the image files |
| 언제 찍은 사진인가요 | 날짜 | yes | 갤러리는 날짜별로 묶여 있습니다. | `date` |
| 무슨 자리였나요 | 단답형 | yes | 예: DH2026, 대전 모임 | `event` |
| 사진마다 한 줄 설명 | 장문형 | no | 올린 순서대로 한 줄에 하나씩. 예: 마이크를 잡은 채연 | `caption` |
| 영어로도 | 장문형 | no | | `caption_en` |
| 사진에 나온 분들께 웹사이트 공개 동의를 받았습니다 | 체크박스 · 필수 응답 | yes | 프로필 사진과 달리 이 사진들은 본인이 올린 것이 아니어서, 동의가 필요합니다. | — |

The consent box is a one-option checkbox marked required, so the form will not
submit without it. That is the gallery's existing rule made mechanical.

### Section 4 · 내 프로필 수정 → `_data/people.yml`

| Question | Type | Req. | Help text |
| --- | --- | --- | --- |
| 무엇을 고칠까요 | 체크박스 | yes | 소속 / 전공 / 소개글 / 사진 / 이름 로마자 표기 / 링크(LinkedIn 등) / 내리고 싶습니다 |
| 고친 내용 | 장문형 | yes | 항목마다 한 줄로 써주세요. 예: 소속: 서울대학교 정치외교학부 |
| 영어로도 | 장문형 | no | |
| 새 사진 | 파일 업로드 · 이미지 · 1개 | no | |

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
| 요약 | 장문형 | yes | 길이는 자유입니다. 문단은 빈 줄로 나눠주세요. | body |
| 영어로도 | 장문형 | no | | `title_en`, `content_en` |

### Section 6 · 그 밖의 제안·오류 신고

| Question | Type | Req. |
| --- | --- | --- |
| 어느 페이지인가요 | 드롭다운: 홈 / 소개 / 사람 / 발제 / 소식 / 갤러리 / 모르겠습니다 | yes |
| 무엇이 문제인가요 | 장문형 | yes |
| 화면 사진 | 파일 업로드 · 이미지 | no |

## Where the form link goes

A form nobody can find collects nothing. Once the form exists, its link
belongs in the site footer and at the foot of the 소식 and 갤러리 pages,
labelled 「소식·사진 보내기」.
