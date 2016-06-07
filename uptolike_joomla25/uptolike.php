<?php


// no direct access
defined('_JEXEC') or die;

jimport('joomla.plugin.plugin');



class plgContentUptolike extends JPlugin
{
    public $jsCode = "
<script type='text/javascript'>(function (w, doc) {
    if (!w.__utlWdgt) {
        w.__utlWdgt = true;
        var d = doc, s = d.createElement('script'), g = 'getElementsByTagName';
        s.type = 'text/javascript';
        s.charset = 'UTF-8';
        s.async = true;
        s.src = ('https:' == w.location.protocol ? 'https' : 'http') + '://w.uptolike.com/widgets/v1/uptolike.js';
        var h = d[g]('body')[0];
        h.appendChild(s);
    }
})(window, document);
</script>
";
    //default html code of widget
    public $htmlCode = "
<div data-background-alpha='0.0' data-orientation='horizontal' data-text-color='000000' data-share-shape='round-rectangle' data-buttons-color='ff9300' data-sn-ids='fb.tw.ok.vk.gp.mr.' data-counter-background-color='ffffff' data-share-counter-size='11' data-share-size='30' data-background-color='ededed' data-share-counter-type='common' data-pid data-counter-background-alpha='1.0' data-share-style='1' data-mode='share' data-following-enable='false' data-like-text-enable='false' data-selection-enable='true' data-icon-color='ffffff' class='uptolike-buttons'>
</div>
";
    public function widgetCodePrepare($htmlCode) {

        //$data_url = 'cms' . $_SERVER['HTTP_HOST'];
        $data_pid = 'cms' . str_replace('.', '', preg_replace('/^www\./', '', $_SERVER['HTTP_HOST']));
        $htmlCode = str_replace('data-pid', 'data-pid="' . $data_pid . '"', $htmlCode);
        //$htmlCode = str_replace('data-url', 'data-url="' . $data_url . '"', $htmlCode);

        return $htmlCode;
    }

    public function onContentPrepare($context, &$article, &$params, $page = 0)
    {
        $allowContext = array();
        $allowContext[] =  'com_content.article';
        $on_main = $this->params->get('on_main');

        if('true' == $on_main)
        {
            $allowContext[] = 'com_content.category';
            $allowContext[] = 'com_content.featured';
        }
        $sharePos =  $this->params->get('widget_position');
        $option = JRequest::getCmd('option');

        if (!isset($article->catid))
        {
            $article->catid = '';
        }
        switch ($option) {
            case 'com_content':
                include_once JPATH_ROOT.'/components/com_content/helpers/route.php';
                if (is_null($this->params->get('widget_code'))) {
                    $shares =$this->jsCode.$this->htmlCode;
                } else $shares =  $this->params->get('widget_code');
                $shares = $this->widgetCodePrepare($shares);
                $data_url_str = JRoute::_(ContentHelperRoute::getArticleRoute($article->slug, $article->catslug, $article->language));
                $data_url_str = str_replace(':','-',$data_url_str);
                $data_url_str = str_replace('/index.php','',$data_url_str);
                $data_url_str =  $_SERVER['HTTP_HOST'].'/index.php'.str_replace('?id=','',$data_url_str);

                $shares = str_replace('div data-', 'div data-url="' . $data_url_str . '" data-', $shares);
                //$align = $options['widget_align'];//'left';//'right', 'center';
                // var_dump($widget_code);
                //$align_style = 'style="    text-align: '.$align.';"';
                $shares = str_replace('div ', 'div style="text-align:'.$this->params->get('widget_align').'" ',$shares);
                if(in_array($context, $allowContext)){
                    switch($sharePos)
                    {
                        case "top":
                            $article->text = $shares . $article->text;
                            break;
                        case "bottom":
                            $article->text = $article->text. $shares ;
                            break;
                        case "both":
                            $article->text = $shares .$article->text. $shares ;
                            break;
                        default:
                            $article->text = $shares .$article->text. $shares ;
                            break;
                    }
                }
            default:
                break;
        }
    }
}