/**
 * Builds the intake form described in MAINTENANCE.md, in one run.
 *
 * Google Forms can be created outright from Apps Script, so nobody has to
 * click twenty-odd questions into existence -- and, more to the point, the
 * form can be rebuilt from this file if it is ever lost or wants revising.
 *
 * To run it:
 *   1. script.google.com > 새 프로젝트
 *   2. paste this file over the empty Code.gs, save
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
      '웹사이트에 올릴 소식·사진·수정 요청을 받는 곳입니다. ' +
      '담당자가 확인한 뒤 반영합니다.')
    .setConfirmationMessage('고맙습니다. 담당자가 확인한 뒤 웹사이트에 올립니다.')
    .setProgressBar(true);

  // The person on duty will need to ask follow-ups -- which photo goes with
  // which caption, what a date refers to -- so the address comes with it.
  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.RESPONDER_INPUT);
  } catch (e) {
    form.setCollectEmail(true);  // older Apps Script runtimes
  }

  var todo = [];  // questions this script cannot add; printed at the end

  // ---- Section 1 -----------------------------------------------------
  form.addTextItem()
    .setTitle('이름')
    .setRequired(true);

  var branch = form.addMultipleChoiceItem()
    .setTitle('무엇을 보내시나요?')
    .setRequired(true);

  // ---- Section 2 · 소식 ------------------------------------------------
  var pbNews = form.addPageBreakItem()
    .setTitle('소식')
    .setHelpText('학회 소식, 수상, 논문 채택, 행사 같은 것들입니다.');

  form.addTextItem()
    .setTitle('제목')
    .setHelpText('한 줄로 써주세요. 예: 은교, 찬희, 나현, 채연의 논문이 DH2026에 채택되었습니다!')
    .setRequired(true);
  form.addDateItem()
    .setTitle('날짜')
    .setHelpText('소식이 있었던 날입니다.')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('본문')
    .setHelpText('문단은 빈 줄로 나눠주세요. 목록은 줄 앞에 "- "를 붙이면 됩니다.')
    .setRequired(true);
  form.addTextItem()
    .setTitle('홈에 한 줄로 뜰 요약')
    .setHelpText('비워두시면 본문 첫 문장을 씁니다.');
  form.addParagraphTextItem()
    .setTitle('영어로도 (제목 · 요약 · 본문)')
    .setHelpText('없으면 한국어가 두 언어 모두에 그대로 나옵니다. 오류가 아닙니다.');
  addUpload(form, todo, '함께 올릴 사진', '없으면 비워두셔도 됩니다.', 10);

  // ---- Section 3 · 사진 ------------------------------------------------
  var pbPhoto = form.addPageBreakItem()
    .setTitle('사진')
    .setHelpText('모임과 행사 사진입니다. 갤러리에 날짜별로 묶여 올라갑니다.');

  addUpload(form, todo, '사진',
    '휴대폰에서 찍은 원본 그대로 올려주세요. 크기와 방향은 저희가 맞춥니다.', 20);
  form.addDateItem()
    .setTitle('언제 찍은 사진인가요')
    .setHelpText('갤러리는 날짜별로 묶여 있습니다.')
    .setRequired(true);
  form.addTextItem()
    .setTitle('무슨 자리였나요')
    .setHelpText('예: DH2026, 대전 모임')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('사진마다 한 줄 설명')
    .setHelpText('올린 순서대로 한 줄에 하나씩. 예: 마이크를 잡은 채연');
  form.addParagraphTextItem()
    .setTitle('영어로도');

  // A one-option checkbox marked required will not let the form submit until
  // it is ticked: the gallery's consent rule, made mechanical. Unlike the
  // profile photos, nobody submitted these of themselves.
  form.addCheckboxItem()
    .setTitle('사진에 나온 분들께 웹사이트 공개 동의를 받았습니다')
    .setChoiceValues(['네, 받았습니다'])
    .setRequired(true);

  // ---- Section 4 · 프로필 ----------------------------------------------
  var pbProfile = form.addPageBreakItem()
    .setTitle('내 프로필 수정')
    .setHelpText('사람 페이지에 실린 내 소개입니다.');

  form.addCheckboxItem()
    .setTitle('무엇을 고칠까요')
    .setChoiceValues(['소속', '전공', '소개글', '사진', '이름 로마자 표기',
                      '링크(LinkedIn 등)', '내리고 싶습니다'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('고친 내용')
    .setHelpText('항목마다 한 줄로 써주세요. 예: 소속: 서울대학교 정치외교학부')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('영어로도');
  addUpload(form, todo, '새 사진', '정사각형으로 잘라 200px로 실립니다.', 1);

  // ---- Section 5 · 발제 ------------------------------------------------
  var pbSeminar = form.addPageBreakItem()
    .setTitle('발제 요약')
    .setHelpText('발제 페이지에 실릴 요약글입니다.');

  form.addTextItem().setTitle('발제 제목').setRequired(true);
  form.addDateItem().setTitle('발제 날짜').setRequired(true);
  form.addTextItem().setTitle('발제자').setRequired(true);
  form.addTextItem()
    .setTitle('대주제')
    .setHelpText('그 발제가 속한 주제입니다. 예: 동아시아와 기억');
  form.addParagraphTextItem()
    .setTitle('요약')
    .setHelpText('길이는 자유입니다. 문단은 빈 줄로 나눠주세요.')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('영어로도 (제목 · 요약)');

  // ---- Section 6 · 그 밖의 ---------------------------------------------
  var pbOther = form.addPageBreakItem()
    .setTitle('그 밖의 제안·오류 신고');

  form.addListItem()
    .setTitle('어느 페이지인가요')
    .setChoiceValues(['홈', '소개', '사람', '발제', '소식', '갤러리', '모르겠습니다'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('무엇이 문제인가요')
    .setRequired(true);
  addUpload(form, todo, '화면 사진', '있으면 훨씬 빨리 고칠 수 있습니다.', 3);

  // ---- Branching -------------------------------------------------------
  branch.setChoices([
    branch.createChoice('소식 (수상 · 논문 채택 · 행사 등)', pbNews),
    branch.createChoice('사진 (모임 · 행사 사진)', pbPhoto),
    branch.createChoice('내 프로필 수정 (소속 · 전공 · 소개글 · 사진)', pbProfile),
    branch.createChoice('발제 요약', pbSeminar),
    branch.createChoice('그 밖의 제안 · 오류 신고', pbOther)
  ]);

  // setGoToPage on a page break governs the section *before* it, so sending
  // each branch straight to submit means marking the break that follows it.
  // The last section needs none -- there is nothing after it to fall into.
  pbPhoto.setGoToPage(FormApp.PageNavigationType.SUBMIT);    // after 소식
  pbProfile.setGoToPage(FormApp.PageNavigationType.SUBMIT);  // after 사진
  pbSeminar.setGoToPage(FormApp.PageNavigationType.SUBMIT);  // after 프로필
  pbOther.setGoToPage(FormApp.PageNavigationType.SUBMIT);    // after 발제

  // ---- Responses -------------------------------------------------------
  var sheet = SpreadsheetApp.create('동아시아학제연구회 웹사이트 요청 (응답)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('폼 편집: %s', form.getEditUrl());
  Logger.log('폼 링크: %s', form.getPublishedUrl());
  Logger.log('응답 시트: %s', sheet.getUrl());
  Logger.log('');
  Logger.log('손으로 확인할 것:');
  Logger.log('  · 각 섹션 아래 "다음 섹션으로 진행" 이 "양식 제출"인지 (5곳)');
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
 * than failing the whole run over four questions. Where it cannot, it leaves a
 * section header in the right position saying what belongs there, so the
 * question can be added in place instead of hunted for.
 */
function addUpload(form, todo, title, help, maxFiles) {
  if (typeof form.addFileUploadItem === 'function') {
    var item = form.addFileUploadItem().setTitle(title).setHelpText(help);
    if (typeof item.setMaxNumberOfFiles === 'function') item.setMaxNumberOfFiles(maxFiles);
    if (typeof item.setAllowedFileTypes === 'function') {
      item.setAllowedFileTypes([FormApp.FileType.IMAGE]);
    }
    return;
  }
  form.addSectionHeaderItem()
    .setTitle('[여기에 파일 업로드 질문: ' + title + ']')
    .setHelpText('이미지만, 최대 ' + maxFiles + '개. ' + help +
                 ' — 질문을 추가한 뒤 이 안내문은 지워주세요.');
  todo.push(title + ' (이미지, 최대 ' + maxFiles + '개)');
}
