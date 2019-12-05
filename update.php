<?php

$en = file_get_contents('https://www.canada.ca/en/department-national-defence/maple-leaf.sitemap.xml');
$fr = file_get_contents('https://www.canada.ca/fr/ministere-defense-nationale/feuille-derable.sitemap.xml');

$en = simplexml_load_string($en);
$fr = simplexml_load_string($fr);

file_put_contents('feed.json', $en);

?>