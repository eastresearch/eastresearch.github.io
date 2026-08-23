/**
 * Builds the intake form described in MAINTENANCE.md, in one run.
 *
 * The form is deliberately loose. The first section is the whole form: a name,
 * a box to write anything in, and somewhere to drop files. Submitting from
 * there is a complete submission. Everything after it is optional refinement
 * for whoever feels like being precise, reached only by choosing a category on
 * the way out. Structure here is a prompt, not a gate -- in a group this size
 * the thing that actually breaks a channel like this is nobody using it.
 *
 * To run it:
 *   1. script.google.com > 새 프로젝트
 *   2. paste this file over the empty Code.gs (select all first), save
 *   3. Run > buildForm, and authorise it when asked (it is your own script
 *      making your own form; the warning screen is the unverified-app one --
 *      고급 > 안전하지 않은 페이지로 이동)
 *   4. the execution log prints the form's edit URL, its public link and the
 *      response spreadsheet
 *
 * Re-running makes a second, separate form rather than updating the first.
 */

function buildForm() {
  var form = FormApp.create('동아시아학제연구회 웹사이트 요청')
    .setDescription(
      '웹사이트에 올릴 것을 받는 곳입니다. 형식은 없습니다.')
    .setConfirmationMessage('받았습니다. 확인하고 올리겠습니다.');

  // The person on duty will need to ask follow-ups -- which photo goes with
  // which caption, what a date refers to -- and asking is cheaper than making
  // everyone fill in fields they may not have.
  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.RESPONDER_INPUT);
  } catch (e) {
    form.setCollectEmail(true);  // older Apps Script runtimes
  }

  var todo = [];  // questions this script cannot add; printed at the end

  // ---- Section 1 · the whole form --------------------------------------
  form.addTextItem()
    .setTitle('이름')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('무엇을 올릴까요')
    .setHelpText('소식, 사진 설명, 고칠 곳 — 아무거나.')
    .setRequired(true);

  addUpload(form, todo, '파일', '휴대폰 사진은 원본 그대로 올려주세요.', 20);

  // Not required: most submissions have no photograph in them, and a gate on
  // every one of those to protect the few is the wrong trade. It is a plain
  // statement so that a photograph which does need it usually arrives with it.
  form.addCheckboxItem()
    .setTitle('사진에 사람이 나온다면')
    .setChoiceValues(['나온 분들께 웹사이트 공개 동의를 받았습니다'])
    .setHelpText('모임 사진은 본인이 올린 것이 아니라, 동의 없이는 올리지 않습니다.');

  // Unanswered, this falls through to the section's own navigation, which is
  // 제출 -- so the form is finishable from here in three answers.
  var branch = form.addMultipleChoiceItem()
    .setTitle('더 알려주실 수 있나요?')
    .setHelpText('선택입니다.');

  // ---- Section 2 · 소식 -------------------------------------------------
  var pbNews = form.addPageBreakItem()
    .setTitle('소식')
    .setHelpText('아는 것만 채우면 됩니다.');

  form.addTextItem()
    .setTitle('제목')
    .setHelpText('예: 은교, 찬희, 나현, 채연의 논문이 DH2026에 채택되었습니다!');
  form.addDateItem()
    .setTitle('날짜')
    .setHelpText('소식이 있었던 날.');
  form.addTextItem()
    .setTitle('홈에 한 줄로 뜰 요약')
    .setHelpText('비우면 본문 첫 문장을 씁니다.');
  form.addParagraphTextItem()
    .setTitle('영어로도')
    .setHelpText('없으면 한국어가 그대로 나갑니다.');

  // ---- Section 3 · 사진 -------------------------------------------------
  var pbPhoto = form.addPageBreakItem()
    .setTitle('사진')
    .setHelpText('갤러리는 날짜별로 묶입니다.');

  form.addDateItem()
    .setTitle('언제 찍은 사진인가요');
  form.addTextItem()
    .setTitle('무슨 자리였나요')
    .setHelpText('예: DH2026, 대전 모임');
  form.addParagraphTextItem()
    .setTitle('사진마다 한 줄 설명')
    .setHelpText('올린 순서대로 한 줄에 하나. 예: 마이크를 잡은 채연');
  form.addParagraphTextItem()
    .setTitle('영어로도');

  // ---- Section 4 · 프로필 -----------------------------------------------
  var pbProfile = form.addPageBreakItem()
    .setTitle('내 프로필 수정')
    .setHelpText('사람 페이지에 실린 소개입니다.');

  form.addCheckboxItem()
    .setTitle('무엇을 고칠까요')
    .setChoiceValues(['소속', '전공', '소개글', '사진', '이름 로마자 표기',
                      '링크(LinkedIn 등)', '내리고 싶습니다']);
  form.addParagraphTextItem()
    .setTitle('영어로도');

  // ---- Section 5 · 발제 -------------------------------------------------
  var pbSeminar = form.addPageBreakItem()
    .setTitle('발제 요약')
    .setHelpText('발제 페이지에 실릴 요약입니다.');

  form.addTextItem().setTitle('발제 제목');
  form.addDateItem().setTitle('발제 날짜');
  form.addTextItem().setTitle('발제자');
  form.addTextItem()
    .setTitle('대주제')
    .setHelpText('예: 동아시아와 기억');
  form.addParagraphTextItem()
    .setTitle('영어로도');

  // ---- Branching --------------------------------------------------------
  // No "기타" branch: the first section already is one.
  branch.setChoices([
    branch.createChoice('소식입니다 (수상 · 논문 채택 · 행사 등)', pbNews),
    branch.createChoice('사진입니다', pbPhoto),
    branch.createChoice('내 프로필 수정입니다', pbProfile),
    branch.createChoice('발제 요약입니다', pbSeminar)
  ]);

  // setGoToPage on a page break governs the section *before* it, so sending
  // each branch straight to submit means marking the break that follows it.
  // The first of them is what makes section 1 a complete form on its own; the
  // last section needs none, having nothing after it to fall into.
  pbNews.setGoToPage(FormApp.PageNavigationType.SUBMIT);      // after 1항
  pbPhoto.setGoToPage(FormApp.PageNavigationType.SUBMIT);     // after 소식
  pbProfile.setGoToPage(FormApp.PageNavigationType.SUBMIT);   // after 사진
  pbSeminar.setGoToPage(FormApp.PageNavigationType.SUBMIT);   // after 프로필

  // ---- Responses --------------------------------------------------------
  var sheet = SpreadsheetApp.create('동아시아학제연구회 웹사이트 요청 (응답)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('폼 편집: %s', form.getEditUrl());
  Logger.log('폼 링크: %s', form.getPublishedUrl());
  Logger.log('응답 시트: %s', sheet.getUrl());
  Logger.log('');
  Logger.log('손으로 확인할 것:');
  Logger.log('  · 1항 아래 "다음 섹션으로 진행" 이 "양식 제출" 인지');
  Logger.log('    (이게 맞아야 분류를 안 고르고도 제출이 됩니다)');
  Logger.log('  · 소식 · 사진 · 프로필 섹션도 마찬가지로 "양식 제출"');
  Logger.log('  · 응답 시트에 처리 / 메모 열 두 개 추가');
  if (todo.length) {
    Logger.log('');
    Logger.log('손으로 추가할 파일 업로드 질문 (Apps Script로는 못 만듭니다):');
    for (var i = 0; i < todo.length; i++) Logger.log('  · ' + todo[i]);
  }
}

/**
 * Adds a file upload question, or records it for the operator to add by hand.
 *
 * Apps Script's Form class can read and edit an existing file upload question
 * but has no addFileUploadItem() to create one, so this feature-detects rather
 * than failing the whole run over one question. Where it cannot, it leaves a
 * section header in the right position saying what belongs there, so the
 * question can be added in place instead of hunted for.
 */
function addUpload(form, todo, title, help, maxFiles) {
  if (typeof form.addFileUploadItem === 'function') {
    var item = form.addFileUploadItem().setTitle(title).setHelpText(help);
    if (typeof item.setMaxNumberOfFiles === 'function') item.setMaxNumberOfFiles(maxFiles);
    return;  // any file type on purpose: a PDF or a 한글 file is a submission too
  }
  form.addSectionHeaderItem()
    .setTitle('[파일 업로드 질문 자리: ' + title + ']')
    .setHelpText('모든 형식, 최대 ' + maxFiles + '개. 질문을 만든 뒤 이 안내는 지우세요.');
  todo.push(title + ' (모든 형식, 최대 ' + maxFiles + '개)');
}
