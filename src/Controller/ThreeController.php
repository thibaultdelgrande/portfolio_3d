<?php
// src/Controller/LuckyController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ThreeController extends AbstractController
{
    #[Route('/', name: 'app_3d')]
    public function index(): Response
    {
        return $this->render('index.html.twig');
    }
}