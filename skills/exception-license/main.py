import sys
import json
from playwright.sync_api import sync_playwright
import os

LOGIN_URL = "https://zh.fgw.sz.gov.cn/operWeb/login"
COOKIE_FILE = os.path.join(os.path.dirname(__file__), "cookies.json")

def check_login_status(page):
    """检查是否已登录"""
    try:
        page.goto(LOGIN_URL, timeout=30000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

        print(f"检查登录状态，当前URL: {page.url}")
        print(f"页面标题: {page.title()}")

        if "login" not in page.url.lower():
            print("URL不包含login，已登录")
            return True

        try:
            username_input = page.locator("input[name='u_content']")
            if username_input.count() > 0 and username_input.is_visible():
                print("找到用户名输入框，未登录")
                return False
        except:
            pass

        try:
            login_button = page.locator("#btnSubmit")
            if login_button.count() > 0 and login_button.is_visible():
                print("找到登录按钮，未登录")
                return False
        except:
            pass

        print("未找到登录表单元素，可能已登录")
        return True
    except Exception as e:
        print(f"检查登录状态失败: {e}")
        return False

def save_cookies(context):
    """保存cookie到文件"""
    cookies = context.cookies()
    with open(COOKIE_FILE, "w") as f:
        json.dump(cookies, f)

def load_cookies(context):
    """从文件加载cookie"""
    if os.path.exists(COOKIE_FILE):
        with open(COOKIE_FILE, "r") as f:
            cookies = json.load(f)
            context.add_cookies(cookies)
        return True
    return False

def login_and_wait(page):
    """执行登录流程"""
    print("正在尝试登录...")

    page.goto(LOGIN_URL, timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    print(f"登录页面URL: {page.url}")

    iframes = page.frames
    print(f"登录页面共有 {len(iframes)} 个iframe")

    username_filled = False
    password_filled = False

    for frame in iframes:
        try:
            username_input = frame.locator("input[name='u_content']")
            if username_input.count() > 0:
                print(f"在iframe中找到用户名输入框")
                frame.fill("input[name='u_content']", "admin")
                username_filled = True
                
                password_input = frame.locator("input[name='p_content']")
                if password_input.count() > 0:
                    frame.fill("input[name='p_content']", "WixTUiBRf*aM5")
                    password_filled = True
                    print("已输入用户名和密码")
                break
        except Exception as e:
            print(f"尝试在iframe中填充用户名失败: {e}")
            continue

    if not username_filled:
        try:
            page.fill("input[name='u_content']", "admin")
            page.fill("input[name='p_content']", "WixTUiBRf*aM5")
            username_filled = True
            password_filled = True
        except Exception as e:
            print(f"填充用户名密码失败: {e}")

    if username_filled and password_filled:
        print("已输入用户名和密码，自动点击登录按钮...")
        
        login_clicked = False
        for frame in iframes:
            try:
                login_button = frame.locator("#btnSubmit")
                if login_button.count() > 0:
                    login_button.click()
                    login_clicked = True
                    print("已点击登录按钮")
                    break
            except:
                pass
        
        if not login_clicked:
            try:
                page.click("#btnSubmit")
                print("已点击登录按钮")
            except:
                print("点击登录按钮失败，请手动点击")
    else:
        print("请在浏览器中手动输入用户名admin，密码和验证码，然后点击登录...")

    print("我将等待您完成登录...")
    
    import time
    start_time = time.time()
    timeout_seconds = 30
    last_url = ""
    
    while time.time() - start_time < timeout_seconds:
        current_url = page.url.lower()
        
        if current_url != last_url:
            print(f"URL变化: {page.url}")
            last_url = current_url
        
        if "operweb/portal" in current_url or "operweb/index" in current_url or "/system/main" in current_url:
            print(f"登录成功！当前URL: {page.url}")
            break
        
        if "idp" in current_url or "auth" in current_url:
            print(f"检测到二次验证页面，等待完成... ({int(time.time() - start_time)}秒)")
        
        time.sleep(2)
    else:
        print("等待登录超时（30秒），继续执行...")
        print(f"当前URL: {page.url}")

    page.wait_for_timeout(2000)

    current_url = page.url.lower()
    if "idp" in current_url or "auth" in current_url:
        print("检测到二次验证页面，等待用户完成验证...")
        
        import time
        start_time = time.time()
        timeout_seconds = 60
        
        while time.time() - start_time < timeout_seconds:
            if "idp" not in page.url.lower() and "auth" not in page.url.lower():
                print(f"二次验证完成！当前URL: {page.url}")
                break
            time.sleep(2)
        else:
            print("二次验证等待超时，继续执行...")

    page.goto("https://zh.fgw.sz.gov.cn/operWeb/portal", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    print(f"跳转后URL: {page.url}")
    print(f"跳转后页面标题: {page.title()}")

    return True

def navigate_to_license(page):
    """导航到证照签发页面"""
    print("正在跳转到证照签发页面...")

    try:
        current_url = page.url
        if "idp" in current_url.lower() or "auth" in current_url.lower():
            print("当前仍在二次验证页面，请先完成验证")
            return False

        page.goto("https://zh.fgw.sz.gov.cn/operWeb/portal", timeout=30000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

        print(f"当前URL: {page.url}")

        nav_items = page.locator("ul#side-menu li a")
        found_license_menu = False
        for i in range(nav_items.count()):
            nav_text = nav_items.nth(i).inner_text().strip()
            if "证照管理" in nav_text:
                print(f"找到证照管理菜单，正在点击展开...")
                nav_items.nth(i).click()
                page.wait_for_timeout(1000)
                found_license_menu = True
                break

        if not found_license_menu:
            print("未找到证照管理菜单，尝试直接跳转...")
            page.goto("https://zh.fgw.sz.gov.cn/operWeb/dzzz/info", timeout=30000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(3000)
        else:
            sub_menu_items = page.locator("ul.nav-second-level li a.menuItem")
            for i in range(sub_menu_items.count()):
                sub_text = sub_menu_items.nth(i).inner_text().strip()
                if "证照签发" in sub_text:
                    print(f"点击证照签发菜单...")
                    sub_menu_items.nth(i).click()
                    print("等待iframe内容加载...")
                    page.wait_for_timeout(5000)
                    break

        print(f"当前URL: {page.url}")
        print(f"页面标题: {page.title()}")

        if "idp" in page.url.lower() or "auth" in page.url.lower():
            print("页面仍停留在二次验证页面，请先完成验证后重试")
            return False

        if "login" in page.url.lower():
            print("需要重新登录")
            return False

        print("已到达证照签发页面")
        return True
    except Exception as e:
        print(f"导航到证照签发页面失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_exception_licenses(page):
    """获取状态异常的证照信息"""
    print("正在获取表格内容...")

    try:
        page.wait_for_timeout(2000)

        iframe_elements = page.locator("iframe")

        target_iframe = None
        for i in range(iframe_elements.count()):
            iframe_el = iframe_elements.nth(i)
            try:
                src = iframe_el.get_attribute("src")
                if src and "dzzz/info" in src:
                    target_iframe = iframe_el
                    break
            except:
                pass

        frame = None
        if target_iframe:
            name_attr = target_iframe.get_attribute("name")
            frame = page.frame(name=name_attr)
        else:
            main_iframe = page.locator("iframe.RuoYi_iframe")
            if main_iframe.count() > 0:
                name_attr = main_iframe.first.get_attribute("name")
                frame = page.frame(name=name_attr)

        if not frame:
            frame = page

        table = frame.locator("#bootstrap-table")
        if table.count() == 0:
            table = frame.locator("table.table")

        if table.count() == 0:
            print("未找到表格元素")
            return []

        rows = table.locator("tbody tr")
        row_count = rows.count()

        print(f"表格共有 {row_count} 行数据")

        exception_licenses = []

        headers = table.locator("thead th")
        header_count = headers.count()

        批复文号_index = -1
        状态_index = -1

        for i in range(header_count):
            header_text = headers.nth(i).inner_text().strip()
            if "批复文号" in header_text:
                批复文号_index = i
            elif "状态" in header_text:
                状态_index = i

        print(f"批复文号列索引: {批复文号_index}, 状态列索引: {状态_index}")

        for i in range(row_count):
            row = rows.nth(i)

            cells = row.locator("td")
            if cells.count() == 0:
                continue

            if 状态_index >= 0 and cells.count() > 状态_index:
                status_cell = cells.nth(状态_index)
                status_text = status_cell.inner_text().strip()
                status_color = ""

                try:
                    style = status_cell.evaluate("el => window.getComputedStyle(el).color")
                    bg_style = status_cell.evaluate("el => window.getComputedStyle(el).backgroundColor")

                    if "rgb(255" in style or "red" in style.lower():
                        status_color = "红色"
                    elif "rgb(0, 128" in style or "green" in style.lower():
                        status_color = "绿色"

                    cell_class = status_cell.get_attribute("class") or ""
                    if "danger" in cell_class.lower() or "red" in cell_class.lower():
                        status_color = "红色"
                    elif "success" in cell_class.lower() or "green" in cell_class.lower():
                        status_color = "绿色"

                except:
                    pass

                if status_color == "红色" or "异常" in status_text or "失败" in status_text or "错误" in status_text:
                    批复文号 = ""
                    if 批复文号_index >= 0 and cells.count() > 批复文号_index:
                        批复文号 = cells.nth(批复文号_index).inner_text().strip()

                    exception_licenses.append({
                        "批复文号": 批复文号,
                        "状态": status_text
                    })

        return exception_licenses

    except Exception as e:
        print(f"获取表格内容失败: {e}")
        return []

def main():
    params = {}
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == '--params' and i + 1 < len(args):
            try:
                params = json.loads(args[i + 1])
            except:
                pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        is_logged_in = False

        if load_cookies(context):
            print("已加载保存的cookie，正在检查登录状态...")
            page.goto("https://zh.fgw.sz.gov.cn/operWeb/portal", timeout=30000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

            print(f"检查登录状态，当前URL: {page.url}")

            if "login" not in page.url.lower() and "idp" not in page.url.lower() and "auth" not in page.url.lower():
                print("Cookie有效，已登录状态")
                is_logged_in = True
            else:
                print("Cookie无效或需要重新认证，清除无效Cookie")
                context.clear_cookies()
                page.goto(LOGIN_URL, timeout=30000)
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(2000)
                print(f"跳转后URL: {page.url}")
        else:
            print("未找到保存的cookie，需要登录")

        if not is_logged_in:
            print("未登录，需要进行登录...")
            if login_and_wait(page):
                save_cookies(context)
                is_logged_in = True

        if is_logged_in:
            if navigate_to_license(page):
                exception_licenses = get_exception_licenses(page)

                if exception_licenses:
                    print("\n========== 异常证照列表 ==========")
                    print(f"{'批复文号':<30} {'状态':<20}")
                    print("-" * 50)
                    for license in exception_licenses:
                        print(f"{license['批复文号']:<30} {license['状态']:<20}")
                    print("=" * 50)
                    print(f"\n共找到 {len(exception_licenses)} 条异常证照记录")
                else:
                    print("\n未找到状态异常的证照记录")

        browser.close()

if __name__ == '__main__':
    main()
