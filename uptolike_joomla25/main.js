/**
 * Created by pk1z on 15.04.15.
 */


function regMe(my_mail) {
    str = jQuery.param({
        email: my_mail,
        partner: 'cms',
        projectId: 'cms' + document.location.host.replace(/\-/g, '').replace(new RegExp("^www.", "gim"), "").replace(/\./g, ''),
        url:document.location.host.replace( new RegExp("^www.","gim"),"")
    })
    dataURL = "http://uptolike.com/api/getCryptKeyWithUserReg.json";
    jQuery.getJSON(dataURL + "?" + str + "&callback=?", {}, function (result) {
        var jsonString = JSON.stringify(result);
        var result = JSON.parse(jsonString);
        if ('ALREADY_EXISTS' == result.statusCode) {
            alert('Пользователь с таким email уже зарегистрирован, обратитесь в службу поддержки.');
        } else if ('MAIL_SENDED' == result.statusCode) {
            alert('Ключ отправлен вам на email. Теперь необходимо ввести его в поле ниже.');

            $('#uptolike_email_field').css('background-color','lightgray');
            $('#uptolike_email_field').prop('disabled','disabled');
            $('#cryptkey_field').show();
            $('#get_key_btn_field').hide();
            $('#key_auth_field').show();
            /*
                $('.reg_block').toggle('fast');
                $('.reg_btn').toggle('fast');
                $('.enter_btn').toggle('fast');
                $('.enter_block').toggle('fast');
            */
        } else if ('ILLEGAL_ARGUMENTS' == result.statusCode) {
            alert('Email указан неверно.')
        }
    });
}

//generate constructor url via js
function const_iframe(projectId, partnerId, mail, cryptKey) {
    params = {mail: mail, partner: partnerId, projectId: projectId};
    paramsStr = 'mail=' + mail + '&partner=' + partnerId + '&projectId=' + projectId + cryptKey;
    signature = CryptoJS.MD5(paramsStr).toString();
    params['signature'] = signature;
    if (((typeof(cryptKey) != 'undefined')) && (cryptKey.length > 0 )) {
        return 'http://uptolike.com/api/constructor.html';// return 'http://uptolike.com/api/constructor.html'+$.param(params);
    } else return 'http://uptolike.com/api/constructor.html';
}

var getCode = function () {
    var win = document.getElementById("cons_iframe").contentWindow;
    win.postMessage({action: 'getCode'}, "*");
};

function jgetCode(method) {
    // alert(method);
    window.jmethod = method;
    getCode();
}

function stat_iframe(projectId, partnerId, mail, cryptKey) {
    params = {mail: mail, partner: partnerId, projectId: projectId}
    paramsStr = 'mail=' + mail + '&partner=' + partnerId + '&projectId=' + projectId
    signature = CryptoJS.MD5(paramsStr + cryptKey).toString();
    params['signature'] = signature;
    return 'http://uptolike.com/api/statistics.html?' + $.param(params);
}

function loadScript(url, callback) {

    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",
    function () {

        jQuery( document ).ready(function() {


            $ = jQuery;
            //joomla specific part:

            //copy values
            if ($('#jform_params_uptolike_email')) { $('#uptolike_email_field').val($('#jform_params_uptolike_email').val())}
            if ($('#jform_params_id_number')) {$('#uptolike_cryptkey').val($('#jform_params_id_number').val())}

            //disable input pos2
            if( ($('#jform_params_uptolike_email').val() != '') && ($('#uptolike_email_field').val() != '')) {

                //alert(( ($('#jform_params_uptolike_email').val() != '') && ($('.uptolike_email').val() != '')));
                $('#uptolike_email_field').css('background-color','lightgray');
                $('#uptolike_email_field').prop('disabled','disabled');
                $('#get_key_btn_field').hide();
                $('#after_key_req').show();
                $('#before_key_req').hide();
               $('#cryptkey_field').show();
                $('#key_auth_field').show();
            }

            //user entered email, show tab for enter code
            if (($('#jform_params_uptolike_email').val() != '') && ($('#uptolike_cryptkey').val() == '')) {
                document.location.hash = "stat";
            }
            //fix buttons in settings
            //$('div#con_settings button').css('float', 'none!')

            //fixing system joomla styles (column width)
            $('.readonly.plg-desc').css('width', '100%');

            //hiding widget code field
            $('#jform_params_widget_code-lbl').hide();
            $('#jform_params_widget_code').hide();
            $('#jform_params_id_number').hide();
            $('#jform_params_uptolike_email').hide();
            $('#jform_params_uptolike_json').hide();
            $('#jform_params_uptolike_partner').hide();
            $('#jform_params_uptolike_project').hide();
            $('#jform_params_id_number-lbl').hide();
            $('#jform_params_uptolike_email-lbl').hide();
            $('#jform_params_uptolike_json-lbl').hide();
            $('#jform_params_uptolike_partner-lbl').hide();
            $('#jform_params_uptolike_project-lbl').hide();


            $('a.toolbar').each(function (i, data) {
                method = $(data).attr('onclick')
                $(data).attr('data-onclick', method)
                $(data).attr('onclick', 'jgetCode("' + method + '")')
            })
            //joomla
            var onmessage = function (e) {


                if (window.debug == true) console.log(e);
                if ('ready' == e.data.action) {
                    json = jQuery('input#jform_params_uptolike_json').val();
                    initConstr(json);
                }
                if (('json' in e.data) && ('code' in e.data)) {
                    $('input#jform_params_uptolike_json').val(e.data.json);
                    $('input#jform_params_widget_code').val(e.data.code);
                    if (window.debug == true) alert('got code from iframe');
                    //alert(window.jmethod);
                    //Joomla.submitbutton('plugin.apply')
                    eval(window.jmethod);
                    //jQuery('#settings_form').submit();
                }
                $('iframe#stats_iframe').hide();
                if (e.data.url.indexOf('statistics.html', 0) != -1) {
                    switch (e.data.action) {
                        case 'badCredentials':
                            document.location.hash = "stat";
                            $('#bad_key_field').show();
                            console.log('badCredentials');
                            break;
                        case 'foreignAccess':
                            document.location.hash = "stat";
                            console.log('foreignAccess');
                            break;
                        case 'ready':
                            document.location.hash = "stat";
                            console.log('ready');
                            $('iframe#stats_iframe').show();
                            break;
                        case 'resize':
                            console.log('ready');
                            document.location.hash = "stat";
                            $('iframe#stats_iframe').show();
                            $('#key_auth_field').hide();
                            $('#cryptkey_field').hide();
                            $('#email_tr').hide();
                            $('#after_key_req').hide();
                            break;
                        default:
                           console.log(e.data.action);
                    }

                    if (e.data.action == 'badCredentials') {
                        $('#bad_key_field').show();
                    } e


                }
                if ((e.data.url.indexOf('constructor.html', 0) != -1) && (typeof e.data.size != 'undefined')) {
                    if (e.data.size != 0) document.getElementById("cons_iframe").style.height = e.data.size + 'px';
                    //alert(e.data.size);
                }
                if ((e.data.url.indexOf('statistics.html', 0) != -1) && (typeof e.data.size != 'undefined')) {
                    if (e.data.size != 0)  document.getElementById("stats_iframe").style.height = e.data.size + 'px';
                }
            };
            if (typeof window.addEventListener != 'undefined') {
                window.addEventListener('message', onmessage, false);
            } else if (typeof window.attachEvent != 'undefined') {
                window.attachEvent('onmessage', onmessage);
            }
            function initConstr(jsonStr) {
                var win = document.getElementById("cons_iframe").contentWindow;
                if ('' !== jsonStr) {
                    win.postMessage({action: 'initialize', json: jsonStr}, "*");
                }
            }

            /*function regMe(my_mail) {
             str = jQuery.param({ email: my_mail, partner: 'cms', projectId: 'cms' + document.location.host.replace(/\-/g, '').replace(new RegExp("^www.", "gim"), "").replace(/\./g, '')})
             dataURL = "http://uptolike.com/api/getCryptKeyWithUserReg.json";
             jQuery.getJSON(dataURL + "?" + str + "&callback=?", {}, function (result) {
             var jsonString = JSON.stringify(result);
             var result = JSON.parse(jsonString);
             if ('ALREADY_EXISTS' == result.statusCode) {
             alert('Пользователь с таким email уже зарегистрирован, обратитесь в службу поддержки.');
             } else if ('MAIL_SENDED' == result.statusCode) {
             alert('Ключ отправлен вам на email. Теперь необходимо ввести его в поле ниже.');
             $('.reg_block').toggle('fast');
             $('.reg_btn').toggle('fast');
             $('.enter_btn').toggle('fast');
             $('.enter_block').toggle('fast');

             } else if ('ILLEGAL_ARGUMENTS' == result.statusCode) {
             alert('Email указан неверно.')
             }
             });
             }
             */

            function hashChange() {
                var hsh = document.location.hash;
                if (('#stat' == hsh) || ('#cons' == hsh)) {

                    $('.nav-tab-wrapper a').removeClass('nav-tab-active');

                    $('.wrapper-tab').removeClass('active');

                    $('#con_'+hsh.slice(1)).addClass('active');
                    $('a.nav-tab#'+hsh).addClass('nav-tab-active');
                    /*
                    /*if ('#reg' == hsh) {
                        $('.reg_btn').show();
                        $('.reg_block').show();
                        $('.enter_btn').hide();
                        $('.enter_block').hide();
                    }
                    if ('#enter' == hsh) {
                        $('.reg_btn').hide();
                        $('.reg_block').hide();
                        $('.enter_btn').show();
                        $('.enter_block').show();
                    }*/
                }
            }

            window.onhashchange = function () {
                hashChange();
            }
            //$('input.id_number').css('width', '520px');//TODO dafuq? fixit
          //  $('.uptolike_email').val($('#uptolike_email').val())//init fields with hidden value (server email)
        //    $('.enter_block input.id_number').attr('value', $('table input.id_number').val());

/*            $('div.enter_block').hide();
            $('div.reg_block').hide();

            $('.reg_btn').click(function () {
                $('.reg_block').toggle('fast');
                $('.enter_btn').toggle('fast');
            })

            $('.enter_btn').click(function () {
                $('.enter_block').toggle('fast');
                $('.reg_btn').toggle('fast');
            })
  */
            //old reg button
            /*$('.reg_block button').click(function () {
                $('.enter_block input.uptolike_email').val($('.reg_block input.uptolike_email').val())
                my_email = $('.reg_block .uptolike_email').val();
                regMe(my_email);
            })*/
            //new reg button
            $('button#get_key').click(function(){
                regMe($('#uptolike_email_field').val());
                $('#jform_params_uptolike_email').val($('#uptolike_email_field').val());

                my_email = $('#uptolike_email_field').val();
                //my_key = $('#uptolike_cryptkey').val();
                //$('#jform_params_id_number').attr('value', my_key);
                $('#jform_params_uptolike_email').attr('value', my_email);
                $('[data-onclick="Joomla.submitbutton(\'plugin.apply\')"]').click();
            });
            //auth cryptkey
            $('button#auth').click(function(){
                my_email = $('#uptolike_email_field').val();
                my_key = $('#uptolike_cryptkey').val();
                $('#jform_params_id_number').attr('value', my_key);
                $('#jform_params_uptolike_email').attr('value', my_email);
                $('[data-onclick="Joomla.submitbutton(\'plugin.apply\')"]').click();
            })

           /*
            //сохраняем мыло и код после получения ключа
            $('.enter_block button').click(function () {
                my_email = $('.enter_block input.uptolike_email').val();
                my_key = $('.enter_block input.id_number').val();
                $('#jform_params_id_number').attr('value', my_key);
                $('#jform_params_uptolike_email').attr('value', my_email);
                $('[data-onclick="Joomla.submitbutton(\'plugin.apply\')"]').click();
            })
            */
            //если юзер не зареган
            if ($('.id_number').val() == '') {
                $('#uptolike_email').after('<button type="button" onclick="regMe();">Зарегистрироваться</button>');
                json = $('input#uptolike_json').val();
                initConstr(json);
            }
            $('#widget_code').parent().parent().attr('style', 'display:none');
            $('#uptolike_json').parent().parent().attr('style', 'display:none')
            $('table .id_number').parent().parent().attr('style', 'display:none')
            $('#uptolike_email').parent().parent().attr('style', 'display:none')

            $('.nav-tab-wrapper a').click(function (e) {
                e.preventDefault();
                var click_id = $(this).attr('id');
                document.location.hash = click_id;
                if (click_id != $('.nav-tab-wrapper a.nav-tab-active').attr('id')) {
                    $('.nav-tab-wrapper a').removeClass('nav-tab-active');
                    $(this).addClass('nav-tab-active');
                    $('.wrapper-tab').removeClass('active');
                    $('#con_' + click_id).addClass('active');
                }
            });
            var host = window.location.hostname;
            hashChange();
            $.getScript("http://uptolike.com/api/getsession.json")
                .done(function () {
                    partnerId = 'cms';
                    projectId = 'cms' + document.location.host.replace(/\-/g, '').replace(new RegExp("^www.", "gim"), "").replace(/\./g, '');
                    email = document.getElementById('jform_params_uptolike_email').value;
                    document.getElementById('jform_params_id_number').value = document.getElementById('jform_params_id_number').value.replace(/[ \t\r]+/g, "");
                    cryptKey = document.getElementById('jform_params_id_number').value;
                    //s.replace(/[ \t\r]+/g,"");
                    $('iframe#cons_iframe').attr('src', const_iframe(projectId, partnerId, email, cryptKey));
                    //if we have cryptkey
                    if ($('#jform_params_id_number').val() !== '') {
                       // $('p.uptolike_guest').hide();
                       // $('iframe#stats_iframe').show();
                        $('iframe#stats_iframe').attr('src', stat_iframe(projectId, partnerId, email, cryptKey));
                    } else {
                       // $('p.uptolike_guest').show();
                       // $('iframe#stats_iframe').hide();
                    }
                });

        })
    }
)
