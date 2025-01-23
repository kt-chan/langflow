from pydantic import BaseModel, Field
from typing import Optional, Union
from loguru import logger
from langchain.tools import StructuredTool
from langchain_core.tools import ToolException
from langflow.schema import Data
from langflow.io import Output
from langflow.base.langchain_utilities.model import LCToolComponent
from langflow.field_typing import Tool
from langflow.inputs import StrInput, MessageTextInput, IntInput
from langflow.schema import Data
from pathlib import Path


class PuppeteerWebBaseLoaderSchema(BaseModel):
    url: str = Field(..., description="The URL to fetch content from")
    wait_time: Optional[int] = Field(
        default=10, description="Time to wait for the page to load"
    )


class PuppeteerWebBaseLoader(LCToolComponent):
    display_name: str = "PuppeteerWebBaseLoader"
    description: str = "Fetch content from a dynamic webpage using Selenium"
    name: str = "puppeteer_web_base_loader"
    icon: str = "cloud-download"

    inputs = [
        MessageTextInput(
            name="url",
            display_name="URL",
            list=False,
            info="Enter one URL.",
            advanced=False,
            tool_mode=True,
        ),
        IntInput(name="wait_time", display_name="wait time (s)", value=10),
    ]

    def build_tool(self) -> Tool:
        return StructuredTool.from_function(
            name="puppeteer_web_base_loader",
            description="Fetch content from a dynamic webpage using Selenium",
            func=self._fetch_url_content,
            args_schema=PuppeteerWebBaseLoaderSchema,
        )

    def run_model(self) -> Data | list[Data]:
        content = self._fetch_url_content(self.url, self.wait_time)
        data = [Data(data=content)]
        self.status = data
        return data

    def _parseHtml(self, html_content):
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text(separator="\n", strip=True)

    def _fetch_url_content(self, url: str, wait_time: int) -> dict:

        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service
        from webdriver_manager.chrome import ChromeDriverManager

        options = Options()
        options.add_argument("--headless")  # Headless mode
        options.add_argument("--disable-gpu")  # Disable GPU acceleration
        options.add_argument("--no-sandbox")  # Disable sandbox mode
        options.add_argument("--disable-dev-shm-usage")  # Disable /dev/shm

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )
        print("Driver initialized successfully.")
        # Wait for the page to load
        try:
            driver.get(url)
            element = WebDriverWait(driver, wait_time).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            content = self._parseHtml(element.get_attribute("outerHTML"))
            return {"content": content, "metadata": {"url": url}}
        except Exception as e:
            print(f"Failed to load the page: {e}")
        finally:
            driver.quit()
